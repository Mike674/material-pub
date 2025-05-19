'use client'
import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

interface FormData {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  number: string;
  dependencia: string;
}

const Register = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    lastname: '',
    email: '',
    password: '',
    role: '',
    number: '',
    dependencia: '',
  });
  const [message, setMessage] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, formData);
      setMessage('Registro exitoso!');
      console.log(response.data);
    } catch (error) {
      setMessage('Error en el registro.');
      console.error(error);
    }
  };

  return (
    <div>

      <Navbar />
    <Container component="main" maxWidth="xs">
      {/* <Navbar /> */}
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={4}
        bgcolor="none"
        boxShadow={4}
        borderRadius={3}
        width="100%"
        maxWidth={500}
        height={780}
        mt={5}
        sx={{
          border: '1px solid #60595D',
          backgroundImage: 'url(/fondogral.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 style={{ fontFamily: 'gothamrnd_bold', color: '#60595D', textAlign: 'center', marginBottom: 0 }}>Registro</h1>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 3 }}
        >
          <TextField
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            style={{ backgroundColor: 'white' }}
          />
          <TextField
            label="Apellido"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            fullWidth
            margin="normal"
            style={{ backgroundColor: 'white' }}
          />
          <TextField
            label="Correo Electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            style={{ backgroundColor: 'white' }}
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            style={{ backgroundColor: 'white' }}
          />
          <FormControl fullWidth required margin="normal">
            <InputLabel id="role-label">Rol de usuario</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleSelectChange}
              label="Rol de usuario"
              style={{ backgroundColor: 'white' }}
            >
              <MenuItem value="operativo">OPERATIVO</MenuItem>
              <MenuItem value="responsable">RESPONSABLE</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Número de Celular"
            name="number"
            value={formData.number}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            style={{ backgroundColor: 'white' }}
          />
          <FormControl fullWidth required margin="normal">
            <InputLabel id="dependencia-label">Dependencia</InputLabel>
            <Select
              labelId="dependencia-label"
              id="dependencia"
              name="dependencia"
              value={formData.dependencia}
              onChange={handleSelectChange}
              label="Dependencia"
              style={{ backgroundColor: 'white' }}
            >
              <MenuItem value="dif">Sistema Para el Desarrollo Integral de la Familia</MenuItem>
              <MenuItem value="sebien">Secretaría de Bienestar e Igualdad Sustantiva</MenuItem>
              <MenuItem value="stjl">Secretaría del Trabajo y Justicia Laboral</MenuItem>
              <MenuItem value="injuve">Instituto Nayarita de la Juventud</MenuItem>
              <MenuItem value="cecan">Consejo Estatal para la Cultura y las Artes de Nayarit</MenuItem>
              <MenuItem value="iprovinay">Instituto Promotor de la Vivienda de Nayarit</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            
            sx={{ mt: 3, mb: 2, backgroundColor:'#C5B099', color: '#fff',fontFamily: 'gothamrnd_bold',
              '&:hover': {
                backgroundColor: '#c5b8a8',
                color: '#60595D'
              }
             }}
          >
            Registrarse
          </Button>
          {message && (
            <Typography variant="body2" color="textSecondary" align="center">
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
    <Footer />
    </div>
  );
};

export default Register;

const buttonStyles = {
    textDecoration: 'none',
    color: '#60595D',
    backgroundColor: '#dacec0',
    transition: 'all 0.3s ease',
    fontFamily: 'gothamrnd_bold',
    fontSize: '16px',
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.5px',
    height: '100%',
    '&:hover': {
        backgroundColor: '#c5b8a8' 
    }
};
