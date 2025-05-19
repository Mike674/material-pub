'use client';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Grid, Typography } from '@mui/material';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import Container from '@mui/material/Container';
import Link from 'next/link';

const Navbar: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    function HomeIcon(props: SvgIconProps) {
        return (
            <SvgIcon {...props}>
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </SvgIcon>
        );
    }

    return (
        <div>
            <Box sx={{ width: '100%', backgroundColor: '#dacec0', py: 2 }}>
                <Container maxWidth="lg">
                    <Grid 
                        container 
                    spacing={2} 
                    alignItems="center" 
                    justifyContent="center"
                    sx={{
                        margin: '0 auto', 
                        width: '100%' 
                    }}
                    >
                    <Grid item xs={12} md={3} sx={{ 
                        display: { xs: 'none', md: 'flex' },
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                    }}>
                        <img 
                        src="/logo1.png" 
                        alt="Logo" 
                        style={{ 
                            height: '120px',
                            objectFit: 'contain',
                            margin: '0 auto' 
                        }} 
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        order: { xs: 2, md: 1 } 
                    }}>
                        <Typography 
                        variant="h3" 
                        sx={{ 
                            fontFamily: 'gothamrnd_bold', 
                            color: '#79142A',
                            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
                            lineHeight: '1.2',
                            margin: '0 auto'
                        }}
                        >
                        Padrón Único de Personas Beneficiarias
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{
                        display: 'flex',
                        justifyContent: { xs: 'center', md: 'flex-end' },
                        alignItems: 'center',
                        order: { xs: 1, md: 2 } 
                    }}>
                        <Link href={'/Pages/Home'} passHref>
                        <IconButton sx={{ 
                            p: 0,
                            '&:hover': {
                            transform: 'scale(1.05)'
                            },
                            transition: 'transform 0.3s ease'
                        }}>
                            <img 
                            src="/logoPub.png" 
                            alt="Logo" 
                            style={{ 
                                height: '100px',
                                objectFit: 'contain',
                                margin: '0 auto' 
                            }} 
                            />
                        </IconButton>
                        </Link>
                    </Grid>
                    </Grid>
                </Container>
                </Box>
            <AppBar position="static" sx={{ bgcolor: '#dacec0', height: '60px', width: '70%', margin: 'auto' ,borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px',boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}>
                <Toolbar>
                    
                    {isMobile ? (
                        <>
                            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerOpen}>
                                <MenuIcon />
                            </IconButton>
                            <Drawer
                                anchor="right"
                                open={drawerOpen}
                                onClose={handleDrawerClose}
                                sx={{ '& .MuiDrawer-paper': { width: '250px' } }}
                            >
                                <Box
                                    sx={{ width: '250px', bgcolor: '#dacec0', height: '100%' }}
                                    role="presentation"
                                    onClick={handleDrawerClose}
                                    onKeyDown={handleDrawerClose}
                                >
                                    <Typography color="#60595D" sx={{ mt: 8, mb: 4, fontFamily: 'gothamrnd_medium' }}>
                                        <Link href={'/Pages/Home'}>
                                            <MenuItem onClick={handleDrawerClose} sx={{ color: '#60595D', textDecoration: 'none' }}>Inicio</MenuItem>
                                        </Link>
                                        <Link href={'/Pages/Navbar-pages/Normativa'}>
                                            <MenuItem onClick={handleDrawerClose} sx={{ color: '#60595D', textDecoration: 'none' }}>Normativa</MenuItem>
                                        </Link>
                                        <Link href={'/Pages/Navbar-pages/Descripcion'}>
                                            <MenuItem onClick={handleDrawerClose} sx={{ color: '#60595D', textDecoration: 'none' }}>Descripción del padrón</MenuItem>
                                        </Link>
                                        <Link href={'/Pages/Navbar-pages/Participantes'}>
                                            <MenuItem onClick={handleDrawerClose} sx={{ color: '#60595D', textDecoration: 'none' }}>¿Quiénes participan?</MenuItem>
                                        </Link>
                                        <Link href={'/Pages/Navbar-pages/Formato'}>
                                            <MenuItem onClick={handleDrawerClose} sx={{ color: '#60595D', textDecoration: 'none' }}>Formato del padrón único</MenuItem>
                                        </Link>
                                    </Typography>
                                </Box>
                            </Drawer>
                        </>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" width="100%">
                            <Link href={'/Pages/Home'}>
                                <Button sx={buttonStyles}>
                                    <HomeIcon fontSize="large" />
                                </Button>
                            </Link>
                            <Link href={'/Pages/Navbar-pages/Normativa'}>
                                <Button sx={buttonStyles}>Normativa</Button>
                            </Link>
                            <Link href={'/Pages/Navbar-pages/Descripcion'}>
                                <Button sx={buttonStyles}>Descripción del padrón</Button>
                            </Link>
                            <Link href={'/Pages/Navbar-pages/Participantes'}>
                                <Button sx={buttonStyles}>¿Quiénes participan?</Button>
                            </Link>
                            <Link href={'/Pages/Navbar-pages/Formato'}>
                                <Button sx={buttonStyles}>Formato del padrón único</Button>
                            </Link>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
        </div>
    );
};

const buttonStyles = {
    textDecoration: 'none',
    color: '#60595D',
    transition: 'color 0.3s',
    fontFamily: 'gothamrnd_bold',
    fontSize: '15px',
    '&:hover': { textDecoration: 'underline' },
};

export default Navbar;
