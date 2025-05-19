'use client'
import { Button, Layout, Table, Select, Card, Row, Col, DatePicker, Form } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';

const { Content } = Layout;
const { Option } = Select;

interface FilterValues {
    secretaria?: string;
    municipio?: string;
    programa?: string;
    anio?: string;
}

interface Municipio {
    id: number;
    nombre: string;
}

interface Secretaria {
    id: number;
    nombre: string;
}

interface Programa {
    id: number;
    nombre: string;
}

interface TablaHistoricoItem {
    key: string;
    secretaria: string;
    municipio: string;
    programa: string;
    anio: string;
    beneficiarios: number;
}

const Historico: React.FC = () => {
    // Estados para los filtros
    const [filters, setFilters] = useState<FilterValues>({
        secretaria: undefined,
        municipio: undefined,
        programa: undefined,
        anio: undefined
    });

    // Datos de ejemplo para la tabla
    const [data] = useState<TablaHistoricoItem[]>([
        {
            key: '1',
            secretaria: 'SEBIEN',
            municipio: 'Tepic',
            programa: 'Programa Social 1',
            anio: '2023',
            beneficiarios: 1500
        },
        {
            key: '2',
            secretaria: 'SEDESO',
            municipio: 'Xalisco',
            programa: 'Programa Salud',
            anio: '2023',
            beneficiarios: 800
        },
        {
            key: '3',
            secretaria: 'TRix',
            municipio: 'Bahía de Banderas',
            programa: 'Programa Educativo',
            anio: '2022',
            beneficiarios: 2000
        },
        {
            key: '4',
            secretaria: 'FP Crew',
            municipio: 'Tepic',
            programa: 'Programa Educativo',
            anio: '2023',
            beneficiarios: 1000
        },
        {
            key: '5',
            secretaria: 'FP Crew',
            municipio: 'Tepic',
            programa: 'Programa Educativo',
            anio: '2023',
            beneficiarios: 1000
        },
        {
            key: '6',
            secretaria: 'FP Crew',
            municipio: 'Tepic',
            programa: 'Programa Educativo',
            anio: '2023',
            beneficiarios: 1000
        },
        {
            key: '7',
            secretaria: 'FP Crew',
            municipio: 'Tepic',
            programa: 'Programa Educativo',
            anio: '2023',
            beneficiarios: 1000
        },{
            key: '8',
            secretaria: 'FP Crew',
            municipio: 'Tepic',
            programa: 'Programa Educativo',
            anio: '2023',
            beneficiarios: 1000
        },
        {
            key: '9',
            secretaria: 'FP Crew',
            municipio: 'Tepic',
            programa: 'Programa Educativo',
            anio: '2023',
            beneficiarios: 1000
        },
        {
            key: '10',
            secretaria: 'FP Crew',
            municipio: 'Tepic',
            programa: 'Programa Educativo',
            anio: '2023',
            beneficiarios: 1000
        },{
            key: '11',
            secretaria: 'FP Crew',
            municipio: 'Tepic',
            programa: 'Programa Educativo',
            anio: '2023',
            beneficiarios: 1000
        },
        {
            key: '12',
            secretaria: 'FP Crew',
            municipio: 'Tepic',
            programa: 'Programa Educativo',
            anio: '2023',
            beneficiarios: 1000
        }
    ]);

    const [filteredData, setFilteredData] = useState(data);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedItem, setSelectedItem] = useState<TablaHistoricoItem | null>(null);

    const municipios: Municipio[] = [
        { id: 1, nombre: 'Acaponeta' },
        { id: 2, nombre: 'Ahuacatlán' },
        { id: 3, nombre: 'Amatlán de Cañas' },
        { id: 4, nombre: 'Compostela' },
        { id: 5, nombre: 'Huajicori' },
        { id: 6, nombre: 'Ixtlán del Río' },
        { id: 7, nombre: 'Jala' },
        { id: 8, nombre: 'Xalisco' },
        { id: 9, nombre: 'Del Nayar' },
        { id: 10, nombre: 'Rosamorada' },
        { id: 11, nombre: 'Ruiz' },
        { id: 12, nombre: 'San Blas' },
        { id: 13, nombre: 'San Pedro Lagunillas' },
        { id: 14, nombre: 'Santa María del Oro' },
        { id: 15, nombre: 'Santiago Ixcuintla' },
        { id: 16, nombre: 'Tecuala' },
        { id: 17, nombre: 'Tepic' },
        { id: 18, nombre: 'Tuxpan' },
        { id: 19, nombre: 'La Yesca' },
        { id: 20, nombre: 'Bahía de Banderas' }
    ];

    const secretarias: Secretaria[] = [
        { id: 1, nombre: 'SEBIEN' },
        { id: 2, nombre: 'SEDESO' },
        { id: 3, nombre: 'TRix' },
        { id: 4, nombre: 'SEDATU' },
    ];

    const programas: Programa[] = [
        { id: 1, nombre: 'Programa ejemplo 1' },
        { id: 2, nombre: 'Programa ejemplo 2' },
        { id: 3, nombre: 'Programa ejemplo 3' }
    ];

    const handleSearch = () => {
        const filtered = data.filter(item =>
            (filters.secretaria ? item.secretaria.includes(filters.secretaria) : true) &&
            (filters.municipio ? item.municipio.includes(filters.municipio) : true) &&
            (filters.programa ? item.programa.includes(filters.programa) : true) &&
            (filters.anio ? item.anio.includes(filters.anio) : true)
        );
        setFilteredData(filtered);
        setSelectedRowKeys([]);
        setSelectedItem(null);
    };

    const handleClearFilters = () => {
        setFilters({
            secretaria: undefined,
            municipio: undefined,
            programa: undefined,
            anio: undefined
        });
        setFilteredData(data);
        setSelectedRowKeys([]);
        setSelectedItem(null);
    };

    const handleFilterChange = (name: keyof FilterValues, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleYearChange = (date: Dayjs | null, dateString: string | string[]) => {
        const year = Array.isArray(dateString) ? dateString[0] : dateString;
        handleFilterChange('anio', year);
    };

    // Funciones para selección y acciones
    const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: TablaHistoricoItem[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setSelectedItem(selectedRows[0] || null);
    };

    const handleEdit = () => {
        if (selectedItem) {
            console.log('Editar:', selectedItem);
        }
    };

    const handleDelete = () => {
        if (selectedItem) {
            console.log('Eliminar:', selectedItem);
        }
    };

    const columns = [
        {
            title: 'Secretaría',
            dataIndex: 'secretaria',
            key: 'secretaria',
        },
        {
            title: 'Municipio',
            dataIndex: 'municipio',
            key: 'municipio',
        },
        {
            title: 'Programa',
            dataIndex: 'programa',
            key: 'programa',
        },
        {
            title: 'Año',
            dataIndex: 'anio',
            key: 'anio',
        },
        {
            title: 'Beneficiarios',
            dataIndex: 'beneficiarios',
            key: 'beneficiarios',
        },
    ];

    return (
        <div>
            <Navbar />
            <Content style={{ padding: '0 50px', marginTop: 64 }}>
                <h1 style={{ fontFamily: 'gothamrnd_bold', color: '#79142A', textAlign: 'center', marginBottom: 24 }}>Histórico</h1>
                
                <Row gutter={24}>
                    {/* Panel de Filtros */}
                    <Col span={6}>
                        <Card 
                            title="Filtros" 
                            extra={
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button type="primary" onClick={handleSearch} size="small">
                                        Buscar
                                    </Button>
                                    <Button onClick={handleClearFilters} size="small">
                                        Limpiar
                                    </Button>
                                </div>
                            }
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Select
                                    placeholder="Secretaría"
                                    allowClear
                                    style={{ width: '100%' }}
                                    onChange={(value) => handleFilterChange('secretaria', value as string)}
                                    value={filters.secretaria}
                                >
                                    {secretarias.map(sec => (
                                        <Option key={sec.id} value={sec.nombre}>
                                            {sec.nombre}
                                        </Option>
                                    ))}
                                </Select>

                                <Select
                                    placeholder="Todos los municipios"
                                    allowClear
                                    showSearch
                                    style={{ width: '100%' }}
                                    onChange={(value) => handleFilterChange('municipio', value as string)}
                                    value={filters.municipio}
                                    optionFilterProp="children"
                                    filterOption={(input, option) => {
                                        if (!option?.children) return false;
                                        return String(option.children).toLowerCase().includes(input.toLowerCase());
                                    }}
                                >
                                    {municipios.map(mun => (
                                        <Option key={mun.id} value={mun.nombre}>
                                            {mun.nombre}
                                        </Option>
                                    ))}
                                </Select>

                                <Select
                                    placeholder="Programa"
                                    allowClear
                                    style={{ width: '100%' }}
                                    onChange={(value) => handleFilterChange('programa', value as string)}
                                    value={filters.programa}
                                >
                                    {programas.map(prog => (
                                        <Option key={prog.id} value={prog.nombre}>
                                            {prog.nombre}
                                        </Option>
                                    ))}
                                </Select>

                                <Form.Item label="Año">
                                    <DatePicker
                                        picker="year"
                                        style={{ width: '100%' }}
                                        onChange={handleYearChange}
                                        placeholder="Todos los años"
                                        value={filters.anio ? dayjs(filters.anio, 'YYYY') : null}
                                    />
                                </Form.Item>
                            </div>
                        </Card>
                    </Col>

                    {/* Tabla */}
                    <Col span={18}>
                        <Card bodyStyle={{ padding: 0 }}>
                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                scroll={{ x: 'max-content' }}
                                pagination={{ pageSize: 10 }}
                                onRow={(record) => ({
                                    onClick: () => {
                                        setSelectedRowKeys([record.key]);
                                        setSelectedItem(record);
                                    },
                                    style: {
                                        backgroundColor: selectedRowKeys.includes(record.key) ? '#f0f7ff' : 'inherit',
                                        cursor: 'pointer'
                                    }
                                })}
                            />
                        </Card>
                    </Col>
                </Row>

                <div style={{ //Div de botones: Editar y Eliminar.
                    position: 'fixed',
                    bottom: '210px',
                    left: '30px',
                    display: 'flex',
                    gap: '15px',
                    zIndex: 1000,
                    padding: '10px',
                    borderRadius: '4px',
                  }}>
                    <IconButton //Boton de editar
                        onClick={()=>console.log('Codigo para editar un elemento')}
                        disabled={!selectedItem}
                        size='large'
                        sx={{ 
                          color: 'white',
                          width:70,
                          height:70,
                          backgroundColor: selectedItem ? '#f1b222':'#BDBDBD',
                          '&:hover': { 
                            backgroundColor: selectedItem ? '#c59322' : '#BDBDBD' 
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>

                    <IconButton //Boton de eliminar
                        onClick={()=>console.log('Codigo para eliminar un elemento')}
                        disabled={!selectedItem}
                        sx={{
                          width:70,
                          height:70,
                          color:'white',
                          backgroundColor:selectedItem ? '#e74c3c':'#BDBDBD',
                          '&:hover':{
                            backgroundColor:selectedItem ?'#922b21':'#BDBDBD'
                          }
                        }}
                        >
                          <DeleteIcon/>
                      </IconButton>
                </div>
            </Content>
            <Footer />
        </div>
    );
};


export default Historico;