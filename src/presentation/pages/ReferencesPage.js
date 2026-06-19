import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText,
  TextField, Button, IconButton, CircularProgress,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { dbApi } from '../../data-access/db/sqliteDb';

const RefSection = ({ title, items, onAdd, onDelete, placeholder }) => {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue('');
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField size="small" fullWidth placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} />
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Добавить</Button>
      </Box>
      <List dense>
        {items.map((item) => (
          <ListItem key={item.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => onDelete(item.id)}><Delete /></IconButton>
            }
          >
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const ReferencesPage = () => {
  const [workTypes, setWorkTypes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [wt, tmpl] = await Promise.all([
        dbApi.references.getWorkTypes(),
        dbApi.references.getTemplates(),
      ]);
      setWorkTypes(wt);
      setTemplates(tmpl);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addWorkType = async (name) => { await dbApi.references.addWorkType(name); load(); };
  const deleteWorkType = async (id) => { await dbApi.references.deleteWorkType(id); load(); };
  const addTemplate = async (name) => { await dbApi.references.addTemplate(name); load(); };
  const deleteTemplate = async (id) => { await dbApi.references.deleteTemplate(id); load(); };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Box>
      <RefSection title="Виды работ" items={workTypes} onAdd={addWorkType} onDelete={deleteWorkType} placeholder="Новый вид работ" />
      <RefSection title="Шаблоны задач" items={templates} onAdd={addTemplate} onDelete={deleteTemplate} placeholder="Новый шаблон" />
    </Box>
  );
};

export default ReferencesPage;
