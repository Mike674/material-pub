'use client'

import { Grid } from "@mui/material";
import ActionAreaCard from "../Components/CardComponent";
import Carousel from "../Components/Carousel";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const images = [
    '/carrusel1.png',
    '/carrusel2.png',
    '/carrusel3.png',
];

const cardsData = [
    { id: 1, imageUrl: '/personas.png', title: 'Beneficiarios', description: 'Búsqueda por beneficiarios', href: '/Pages/Filtros/Beneficiarios-filtro' },
    { id: 2, imageUrl: '/dependencias.png', title: 'Dependencias', description: 'Búsqueda por dependencias', href: '/Pages/Filtros/Dependencias-filtro' },
    { id: 3, imageUrl: '/programa.png', title: 'Programas', description: 'Búsqueda por programas', href: '/Pages/Filtros/Programas-filtro' },
    { id: 4, imageUrl: '/historico-test.png', title: 'Historicos', description: 'Consulta por historicos', href: '/Pages/Filtros/Historico-filtro' }
];

const Home = () => {
    return (
        <div>
            <Navbar />
            <Carousel images={images} maxWidth="60%" />
            <Grid container justifyContent="center" marginTop={5} spacing={2}>
                {cardsData.map((card) => (
                    <Grid item key={card.id} xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <ActionAreaCard
                            imageUrl={card.imageUrl}
                            title={card.title}
                            description={card.description}
                            href={card.href}
                        />
                    </Grid>
                ))}
            </Grid>
            <Footer />
        </div>
    );
};

export default Home;