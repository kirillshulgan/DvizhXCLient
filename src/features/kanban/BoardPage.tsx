import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Paper, IconButton, AppBar, Toolbar, Button, 
    Card as MuiCard, CardContent, Chip, Stack,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

import { kanbanService } from '../../api/kanbanService';
import { eventService } from '../../api/eventService';
import { signalRService } from '../../api/signalrService';
import type { Board, Card } from '../../types';

// Интерфейс для формы создания/редактирования
interface CardFormData {
    id: string;
    title: string;
    description: string;
}

export const BoardPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [board, setBoard] = useState<Board | null>(null);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [cardForm, setCardForm] = useState<CardFormData>({ id: '', title: '', description: '' });
    
    const [inviteCode, setInviteCode] = useState<string | null>(null);

    // --- Loading Logic ---

    const loadBoard = useCallback(async (boardId: string, silent = false) => {
        if (!silent) setLoading(true);
        try {
            const boardData = await kanbanService.getBoard(boardId);
            
            // Сортировка (лучше делать на бэке, но ок)
            // Создаем копию массива, чтобы сортировать (т.к. в типах у нас readonly)
            const sortedColumns = [...boardData.columns].sort((a, b) => a.orderIndex - b.orderIndex).map(col => ({
                ...col,
                cards: [...col.cards].sort((a, b) => a.orderIndex - b.orderIndex)
            }));
            
            setBoard({ ...boardData, columns: sortedColumns });

            if (boardData.eventId) {
                // Пытаемся получить код приглашения, но не блокируем UI ошибкой
                eventService.getEventById(boardData.eventId)
                    .then(evt => setInviteCode(evt.inviteCode || null))
                    .catch(console.error);
            }

        } catch (err) {
            console.error("Failed to load board", err);
            // Можно добавить редирект или тостер
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    // --- Effects ---

    useEffect(() => {
        if (id) loadBoard(id, false);
    }, [id, loadBoard]);

    useEffect(() => {
        if (!board?.eventId) return;
        const token = localStorage.getItem('accessToken'); // Используем правильный ключ
        if (!token) return;

        const startSocket = async () => {
            await signalRService.startConnection(token);
            await signalRService.joinEvent(board.eventId);

            // Handler for all card events
            const handleUpdate = () => {
                if (board.eventId) {
                    console.log("SignalR update received");
                    loadBoard(board.eventId, true);
                }
            };

            signalRService.on('CardMoved', handleUpdate);
            signalRService.on('CardCreated', handleUpdate);
            signalRService.on('CardDeleted', handleUpdate);
            signalRService.on('CardUpdated', handleUpdate);
        };

        startSocket();

        return () => {
            signalRService.leaveEvent(board.eventId);
            signalRService.stopConnection();
            signalRService.off('CardMoved');
            signalRService.off('CardCreated');
            signalRService.off('CardDeleted');
            signalRService.off('CardUpdated');
        };
    }, [board?.eventId, board?.id, loadBoard]);


    // --- Handlers ---

    const handleOpenCreateDialog = (columnId: string) => {
        setTargetColumnId(columnId);
        setEditingCardId(null);
        setCardForm({ id: '', title: '', description: '' });
        setDialogOpen(true);
    };

    const handleOpenEditDialog = (card: Card) => {
        setEditingCardId(card.id);
        setCardForm({ id: card.id, title: card.title, description: card.description });
        setDialogOpen(true);
    };

    const handleSaveCard = async () => {
        if (!cardForm.title.trim()) return;

        try {
            if (cardForm.id) {
                await kanbanService.updateCard(cardForm.id, {
                    сardId: cardForm.id,
                    title: cardForm.title,
                    description: cardForm.description
                });
            } else if (targetColumnId) {
                await kanbanService.createCard({
                    columnId: targetColumnId,
                    title: cardForm.title,
                    description: cardForm.description
                });
            }
            
            // Ждем SignalR или обновляем вручную
            if (id) loadBoard(id, true);
            setDialogOpen(false);
        } catch (error) {
            console.error("Save failed", error);
            alert("Ошибка сохранения");
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!confirm('Удалить эту задачу?')) return;

        // Optimistic UI Update (Immutably)
        if (board) {
            const newColumns = board.columns.map(col => ({
                ...col,
                cards: col.cards.filter(c => c.id !== cardId)
            }));
            setBoard({ ...board, columns: newColumns });
        }

        try {
            await kanbanService.deleteCard(cardId);
        } catch (error) {
            console.error(error);
            alert("Не удалось удалить карточку");
            if (id) loadBoard(id, true); // Revert
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || !board) return;
        
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // --- Optimistic Update (Immutable way) ---
        const sourceColIndex = board.columns.findIndex(c => c.id === source.droppableId);
        const destColIndex = board.columns.findIndex(c => c.id === destination.droppableId);

        if (sourceColIndex === -1 || destColIndex === -1) return;

        const newColumns = [...board.columns];
        
        // Создаем копии колонок, которые меняем
        const sourceCol = { ...newColumns[sourceColIndex], cards: [...newColumns[sourceColIndex].cards] };
        
        // Если колонка та же самая, используем одну ссылку
        const destCol = sourceColIndex === destColIndex 
            ? sourceCol 
            : { ...newColumns[destColIndex], cards: [...newColumns[destColIndex].cards] };

        // Логика перемещения
        const [movedCard] = sourceCol.cards.splice(source.index, 1);
        
        // Обновляем columnId у карточки (хотя API это сделает, для UI полезно)
        // Но так как у нас readonly Card, создаем новый объект карточки
        const updatedCard = { ...movedCard, columnId: destination.droppableId };
        
        destCol.cards.splice(destination.index, 0, updatedCard);

        newColumns[sourceColIndex] = sourceCol;
        newColumns[destColIndex] = destCol;

        setBoard({ ...board, columns: newColumns });

        // --- API Call ---
        try {
            await kanbanService.moveCard({
                cardId: draggableId,
                targetColumnId: destination.droppableId,
                newOrderIndex: destination.index
            });
        } catch (error) {
            console.error("Move failed", error);
            if (id) loadBoard(id, true); // Revert
        }
    };


    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
    
    if (!board) return <div>Доска не найдена</div>;

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f4f5f7' }}>
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {board.title}
                    </Typography>
                    
                    <Button 
                        color="inherit" 
                        startIcon={<PersonAddIcon />}
                        onClick={() => {
                            if (inviteCode) {
                                navigator.clipboard.writeText(inviteCode);
                                alert(`Код скопирован: ${inviteCode}`);
                            } else {
                                alert("Нет кода приглашения");
                            }
                        }}
                    >
                        Пригласить
                    </Button>
                </Toolbar>
            </AppBar>

            <DragDropContext onDragEnd={onDragEnd}>
                <Box sx={{ flexGrow: 1, display: 'flex', overflowX: 'auto', p: 3, gap: 3, alignItems: 'flex-start' }}>
                    {board.columns.map(column => (
                        <Paper key={column.id} elevation={0} sx={{ minWidth: 300, maxWidth: 300, bgcolor: '#ebecf0', p: 2, maxHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                <Typography variant="subtitle1" fontWeight="bold">{column.title}</Typography>
                                <Chip label={column.cards.length} size="small" />
                            </Box>

                            <Droppable droppableId={column.id}>
                                {(provided) => (
                                    <Stack 
                                        spacing={1} 
                                        sx={{ overflowY: 'auto', flexGrow: 1, minHeight: 10 }} 
                                        ref={provided.innerRef} 
                                        {...provided.droppableProps}
                                    >
                                        {column.cards.map((card, index) => (
                                            <Draggable key={card.id} draggableId={card.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <MuiCard
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => handleOpenEditDialog(card)} 
                                                        sx={{ 
                                                            cursor: 'grab',
                                                            bgcolor: snapshot.isDragging ? '#e3f2fd' : 'white',
                                                            boxShadow: snapshot.isDragging ? 3 : 1,
                                                            ...provided.draggableProps.style 
                                                        }}
                                                    >
                                                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, position: 'relative', pr: 4 }}>
                                                            <IconButton 
                                                                size="small" 
                                                                sx={{ position: 'absolute', top: 4, right: 4, opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteCard(card.id);
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                            <Typography variant="body1" fontWeight={500}>{card.title}</Typography>
                                                            {card.description && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, whiteSpace: 'pre-wrap' }}>{card.description}</Typography>}
                                                        </CardContent>
                                                    </MuiCard>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </Stack>
                                )}
                            </Droppable>

                            <Button startIcon={<AddIcon />} fullWidth sx={{ mt: 1, color: '#5e6c84', justifyContent: 'flex-start' }} onClick={() => handleOpenCreateDialog(column.id)}>
                                Добавить карточку
                            </Button>
                        </Paper>
                    ))}
                </Box>
            </DragDropContext>

            {/* Dialog Component logic kept inline for simplicity, but cleaner */}
            <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingCardId ? 'Редактирование' : 'Новая задача'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Заголовок"
                        fullWidth
                        value={cardForm.title}
                        onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveCard()}
                    />
                    <TextField
                        margin="dense"
                        label="Описание"
                        fullWidth
                        multiline
                        rows={3}
                        value={cardForm.description}
                        onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleSaveCard} variant="contained" disabled={!cardForm.title}>Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
