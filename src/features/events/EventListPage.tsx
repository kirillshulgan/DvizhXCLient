import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../api/eventService';
// Удаляем импорты firebase, так как это теперь глобально в App.tsx
// import { requestForToken, onMessageListener } from '../../firebase';

import { toast } from 'react-hot-toast'; // Импортируем для красивых уведомлений об ошибках

// MUI Imports
import { 
    Container, Grid, Card, CardContent, Typography, Button, 
    CardActionArea, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, Fab, Box, AppBar, Toolbar 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

export const EventListPage = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // Состояние модального окна
    const [openDialog, setOpenDialog] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '' });
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState('');

    useEffect(() => {
        loadEvents();
        // Убрали дублирующую подписку на пуши. 
        // Она теперь живет в App.tsx и работает на всех страницах.
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await eventService.getMyEvents();
            setEvents(data);
        } catch (error) {
            console.error(error);
            toast.error("Не удалось загрузить события"); // Красивая ошибка
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!inviteCode) return;
        try {
            await eventService.joinEvent(inviteCode);
            setJoinDialogOpen(false);
            setInviteCode('');
            await loadEvents();
            toast.success("Вы успешно вступили!"); // Красивый успех
        } catch (error) {
            toast.error("Неверный код приглашения");
        }
    };

    const handleCreate = async () => {
        if (!newEvent.title || !newEvent.date || !newEvent.time) return;

        const combinedDate = new Date(`${newEvent.date}T${newEvent.time}`);
        
        try {
            await eventService.createEvent(newEvent.title, newEvent.description, combinedDate.toISOString());
            setOpenDialog(false);
            setNewEvent({ title: '', description: '', date: '', time: '' });
            loadEvents();
            toast.success("Событие создано!");
        } catch (error) {
            toast.error("Ошибка создания события");
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Верхняя панель */}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Мои События 📅
                    </Typography>
                    <Button color="inherit" onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                    }}>Выйти</Button>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4 }}>
                {loading ? (
                    <Typography>Загрузка...</Typography>
                ) : (
                    <Grid container spacing={3}>
                        {events.map((evt) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={evt.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardActionArea 
                                        onClick={() => navigate(`/board/${evt.id}`)} 
                                        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                                    >
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="div">
                                                {evt.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {evt.description || 'Нет описания'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                <CalendarMonthIcon fontSize="small" />
                                                <Typography variant="caption">
                                                    {evt.startDate ? new Date(evt.startDate).toLocaleString() : 'Дата не указана'}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Плавающие кнопки (FABs) */}
            <Box sx={{ position: 'fixed', bottom: 30, right: 30, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
                
                <Fab 
                    color="secondary" 
                    aria-label="join" 
                    size="medium"
                    onClick={() => setJoinDialogOpen(true)}
                    variant="extended"
                >
                    <GroupAddIcon sx={{ mr: 1 }} />
                    Вступить
                </Fab>

                <Fab 
                    color="primary" 
                    aria-label="add" 
                    onClick={() => setOpenDialog(true)}
                    variant="extended"
                >
                    <AddIcon sx={{ mr: 1 }} />
                    Создать
                </Fab>
            </Box>

            {/* Модальные окна (без изменений, кроме использования toast внутри функций) */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Новая тусовка</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название"
                        fullWidth
                        variant="outlined"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    />
                    <TextField
                        margin="dense"
                        label="Описание"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            type="date"
                            label="Дата"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        />
                        <TextField
                            type="time"
                            label="Время"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
                    <Button onClick={handleCreate} variant="contained">Создать</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
                <DialogTitle>Вступить в тусовку</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Введите код приглашения, который вам дал организатор.
                    </Typography>
                    <TextField
                        autoFocus
                        label="Код приглашения"
                        fullWidth
                        variant="outlined"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setJoinDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleJoin} variant="contained">Вступить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
