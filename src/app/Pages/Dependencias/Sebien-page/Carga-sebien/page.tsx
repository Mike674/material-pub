'use client'
import React, { useState } from 'react';
import { getSession, useSession } from 'next-auth/react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import axios, { AxiosError } from 'axios';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
  Container,
  TablePagination,
  IconButton,
} from '@mui/material';
import Navbar from '../Components/Navbar';
import Footer from '../../../Components/Footer';
import { Beneficiario } from '../../../Interfaces/beneficiarioTable';
import { logo64, logopub64 } from './imagenData';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { green } from '@mui/material/colors';
import { Modal,Form,message, Input, Select, Radio } from 'antd';

const Carga = () => {
  const { data: session, status } = useSession();
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  //Const para poder seleccionar un elemento de la tabla
  const [selectedBeneficiario, setSelectedBeneficiario] = useState<Beneficiario | null>(null);
  //Const para el modal de editar
  const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  const expectedHeaders = [
    "CURP",
    "Primer Apellido",
    "Segundo Apellido",
    "Nombre",
    "Fecha Nacimiento",
    "Cve Ent Fed Nac",
    "Sexo",
    "Discapacidad",
    "Indigena",
    "Cve Civil",
    "Cve Dependencia",
    "Cve Institucion",
    "Cve Programa",
    "Cve Intra-Programa",
    "Cve Ent Fed",
    "Cve Municipio",
    "Cve Localidad",
    "Fecha Beneficio",
    "Cve Tipo Beneficiario",
    "Cve Tipo Beneficio",
    "Cantidad Apoyo",
    "Tipo Vial",
    "Nom Vial",
    "Num Int num",
    "Num Int alf",
    "Nom Loc",
    "Cve Loc",
    "Nom Mun",
    "Cve Mun",
    "Nom Ent",
    "Cve Ent",
    "Observaciones",
  ];

  const cargaDeDatos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx')) {
        setError('Archivo inválido. Por favor, seleccione un archivo .xlsx.');
        return;
      }

      //Validacion de excel

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: [
            'curp',
            'primer_apellido',
            'segundo_apellido',
            'nombre',
            'fecha_nacimiento',
            'cve_ent_nac',
            'sexo',
            'discapacidad',
            'indigena',
            'cve_civil',
            'cve_dependencia',
            'cve_institucion',
            'cve_programa',
            'cve_intra_programa',
            'cve_ent_fed',
            'cve_municipio',
            'cve_localidad',
            'fecha_beneficio',
            'cve_tipo_beneficiario',
            'cve_tipo_beneficio',
            'cantidad_apoyo',
            'tipo_vial',
            'nom_vial',
            'num_int_num',
            'num_int_alf',
            'nom_loc',
            'cve_loc',
            'nom_mun',
            'cve_mun',
            'nom_ent',
            'cve_ent',
            'observaciones',
          ],
          range: 1,
          raw: false,
        }) as Beneficiario[];

        jsonData.forEach((row: any) => {
          if (typeof row.cve_ent_fed === 'string') {
            row.cve_ent_fed = parseInt(row.cve_ent_fed, 10);
          }
          if (typeof row.cantidad_apoyo === 'string') {
            row.cantidad_apoyo = parseFloat(row.cantidad_apoyo.toString().replace(',', '.')).toFixed(2);
          }
        });
        setBeneficiarios(jsonData);
        setError(null);
        console.log('datos', jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const registroDatos = async () => {
    const session = await getSession();
    const dependencia = session?.user?.dependencia;
    const role = session?.user?.role;

    try {
      if (!beneficiarios || beneficiarios.length === 0) {
        throw new Error('No hay datos de beneficiarios para enviar');
      }

      if (!session?.user?.token) {
        setError('Autenticacion no encontrada, vuelve a iniciar sesión.');
        return;
      }

      if (role !== 'operativo') {
        setError('No tienes permisos suficientes para realizar esta acción.');
        return;
      }

      if (dependencia !== 'sebien') {
        setError('Tu dependencia no está autorizada para realizar esta acción.');
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sebien-pub/post-excel`,
        beneficiarios,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.token}`,
          },
        }
      );

      console.log(response.data);
      setLoading(false);
      setSuccessDialogOpen(true);
      setError(null);
      generatePDF(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.data) {
          const responseData = axiosError.response.data;
          if (typeof responseData === 'string') {
            setError(`Error del servidor: ${responseData}`);
          } else if (typeof responseData === 'object' && 'message' in responseData) {
            setError(`Error del servidor: ${responseData.message}`);
          } else {
            setError('Error del servidor desconocido.');
          }
        } else {
          setError('Error de conexión. Por favor, inténtelo de nuevo más tarde.');
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al procesar la solicitud. Por favor, inténtelo de nuevo.');
      }

      setLoading(false);
    }
  };

  const generatePDF = (result: any) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });

    const currentDate = new Date();
    const date = currentDate.toLocaleDateString();
    const time = currentDate.toLocaleTimeString();
    const numBeneficiarios = result.length;

    const primerBeneficiario = result[0] || {};
    const claveDependencia = primerBeneficiario.cve_dependencia || 'No disponible';
    const clavePrograma = primerBeneficiario.cve_programa || 'No disponible';

    const margin = 1;
    const imgWidth = 2;
    const imgWidthPub = 1;
    const imgHeight = 0;
    const imgSpacing = 4;

    const logoX = margin;
    const logopubX = margin + imgWidthPub + imgSpacing;
    const titleY = margin + imgHeight + 0.5;
    const contentY = titleY + 0.5;
    const footerY = 7;
    const contMargin = 2.5;

    doc.addImage(logo64, 'PNG', logoX, margin, imgWidth, imgHeight);
    doc.addImage(logopub64, 'PNG', logopubX, margin, imgWidthPub, imgHeight);

    doc.setFontSize(20);
    doc.setTextColor(121, 20, 42);
    doc.text('Acuse de Registro de Beneficiarios', 2, 2.5);

    doc.setFontSize(12);
    doc.setTextColor(51, 50, 48);
    doc.text(`Fecha de Registro: ${date}`, contMargin, 3.5);
    doc.text('Dependencia: Secretaria de Bienestar e Igualdad Sustantiva.', contMargin, 4.0);
    doc.text(`Hora de Registro: ${time}`, contMargin, 4.5);
    doc.text(`Número de Beneficiarios Registrados: ${numBeneficiarios}`, contMargin, 5.0);

    doc.setFontSize(12);
    doc.text('Revisa y Valida', 2.05, 7);
    doc.setFontSize(14);
    doc.setTextColor(121, 20, 42);
    doc.text('  Enlace Operativo', 1.8, 8.5);
    doc.setFontSize(11);
    doc.setTextColor(51, 50, 48);
    doc.text('      Nombre y Firma', 1.8, 8.7);

    doc.setFontSize(12);
    doc.text('Revisa y Valida', margin + 4, 7);
    doc.setFontSize(14);
    doc.setTextColor(121, 20, 42);
    doc.text('Enlace Responsable', margin + 3.8, 8.5);
    doc.setFontSize(11);
    doc.setTextColor(51, 50, 48);
    doc.text('       Nombre y Firma', 4.8, 8.7); // Detalles del responsable

    doc.save('acuse_de_registro_SEBIEN.pdf');
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleModalCancel =()=>{
    form.resetFields();
    setIsModalVisible(false);
    console.log('Modal cancelado')
  }
  const handleModalOk =()=>{
    console.log('Modal aceptado')
  }

  return (
    <div>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <div style={{ padding: '1rem', maxWidth: 'calc(100vw - 2rem)', width: '100%', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', fontFamily: 'gothamrnd_bold' }}>
            Importar Beneficiarios desde Excel
          </h1>
          <Container
            maxWidth="xl"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              textAlign: 'center',
              padding: '5px',
              marginTop: '25px'
            }}
          >
            <Button onClick={generatePDF}>generar PDF</Button>
            <label htmlFor="upload-excel">
              <input
                id="upload-excel"
                type="file"
                style={{ display: 'none' }}
                onChange={cargaDeDatos}
              />
              <Button
                variant="contained"
                component="span"
                style={{ marginBottom: '5px' }}
                sx={{
                  backgroundColor: '#79142A',
                  color: '#ffffff',
                  fontFamily: 'gothamrnd_medium',
                  fontSize: '16px',
                  '&:hover': {
                    backgroundColor: '#79142A',
                    color: '#ffffff',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                  },
                }}
              >
                Seleccionar archivo
              </Button>
            </label>
            <Button
              variant="contained"
              onClick={registroDatos}
              disabled={loading}
              sx={{
                backgroundColor: '#79142A',
                color: '#ffffff',
                fontFamily: 'gothamrnd_medium',
                fontSize: '14px',
                '&:hover': {
                  backgroundColor: '#79142A',
                  color: '#ffffff',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                'Carga de Archivos'
              )}
            </Button>
            
            
              <div style={{ //Div de botones: Editar y Eliminar.
               position: 'fixed',
                bottom: '210px',
                right: '30px',
                display: 'flex',
                gap: '15px',
                zIndex: 1000,
                padding: '10px',
                borderRadius: '4px',
                  }}>
                        <IconButton  //Boton de Editar
                        onClick={() => {
                          if(selectedBeneficiario){
                            form.setFieldsValue({
                              "CURP": selectedBeneficiario.curp,
                              "Primer apellido": selectedBeneficiario.primer_apellido,
                              "Segundo apellido": selectedBeneficiario.segundo_apellido,
                              "Nombre(s)": selectedBeneficiario.nombre,
                              "Fecha de nacimiento": selectedBeneficiario.fecha_nacimiento,
                              "Entidad de nacimiento": selectedBeneficiario.cve_ent_nac,
                              "Sexo": selectedBeneficiario.sexo,
                              "Discapacidad": selectedBeneficiario.discapacidad,
                              "Indigena": selectedBeneficiario.indigena,
                              "Estado civil": selectedBeneficiario.cve_civil,
                              "Dependencia": selectedBeneficiario.cve_dependencia,
                              "Institucion": selectedBeneficiario.cve_institucion,
                              "Programa": selectedBeneficiario.cve_programa,
                              "Intra-programa": selectedBeneficiario.cve_intra_programa,
                              "Entidad federativa": selectedBeneficiario.cve_ent_fed,
                              "Municipio": selectedBeneficiario.cve_municipio,
                              "Num_Localidad": selectedBeneficiario.cve_localidad, //Revisar este campo con los demas strings de: Localidad
                              "Fecha de beneficio": selectedBeneficiario.fecha_beneficio,
                              "Tipo de beneficiario": selectedBeneficiario.cve_tipo_beneficiario,
                              "Tipo de beneficio": selectedBeneficiario.cve_tipo_beneficio,
                              "Cantidad de apoyo": selectedBeneficiario.cantidad_apoyo,
                              "Tipo de vial": selectedBeneficiario.tipo_vial,
                              "Nombre de Vialidad": selectedBeneficiario.nom_vial,
                              "Numero de vialidad / Numero": selectedBeneficiario.num_int_num,
                              "Numero de vialidad / Alfanumérico": selectedBeneficiario.num_int_alf,
                              "Localidad": selectedBeneficiario.nom_loc,
                              "Clave de localidad": selectedBeneficiario.cve_loc,
                              "Nombre Municipio":selectedBeneficiario.nom_mun,
                              "Clave de municipio": selectedBeneficiario.cve_mun,
                              "Clave de entidad federativa": selectedBeneficiario.cve_ent,
                              "Observaciones": selectedBeneficiario.observaciones
                            });
                          }
                          setIsModalVisible(true)
                        }}
                        disabled={!selectedBeneficiario}
                        size='large'
                        sx={{ 
                          color: 'white',
                          width:70,
                          height:70,
                          backgroundColor: selectedBeneficiario ? '#f1b222':'#BDBDBD',
                          '&:hover': { 
                            backgroundColor: selectedBeneficiario ? '#c59322' : '#BDBDBD' 
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton //Boton de eliminar
                        onClick={()=>console.log('Codigo para eliminar un elemento')}
                        disabled={!selectedBeneficiario}
                        sx={{
                          width:70,
                          height:70,
                          color:'white',
                          backgroundColor:selectedBeneficiario ? '#e74c3c':'#BDBDBD',
                          '&:hover':{
                            backgroundColor:selectedBeneficiario ?'#922b21':'#BDBDBD'
                          }
                        }}
                        >
                          <DeleteIcon/>
                      </IconButton>
                    </div>

            {error && <p style={{ color: 'red', textAlign: 'center', fontFamily: 'gothamrnd_medium' }}>{error}</p>}
            {beneficiarios.length > 0 && (
              <>
                <TableContainer component={Paper} style={{ marginTop: '1rem' }}>
                  <Table>
                    <TableHead>
                      <TableRow >
                        <TableCell sx={styles.tableCell}>N°</TableCell>
                        <TableCell sx={styles.tableCell}>Curp</TableCell>
                        <TableCell sx={styles.tableCell}>Primer Apellido</TableCell>
                        <TableCell sx={styles.tableCell}>Segundo Apellido</TableCell>
                        <TableCell sx={styles.tableCell}>Nombre</TableCell>
                        <TableCell sx={styles.tableCell}>Fecha de Nacimiento</TableCell>
                        <TableCell sx={styles.tableCell}>Entidad de Nacimiento</TableCell>
                        <TableCell sx={styles.tableCell}>Sexo</TableCell>
                        <TableCell sx={styles.tableCell}>Discapacidad</TableCell>
                        <TableCell sx={styles.tableCell}>Indígena</TableCell>
                        <TableCell sx={styles.tableCell}>Estado Civil</TableCell>
                        <TableCell sx={styles.tableCell}>Dependencia</TableCell>
                        <TableCell sx={styles.tableCell}>Institución</TableCell>
                        <TableCell sx={styles.tableCell}>Programa</TableCell>
                        <TableCell sx={styles.tableCell}>Intra-Programa</TableCell>
                        <TableCell sx={styles.tableCell}>Entidad Federativa</TableCell>
                        <TableCell sx={styles.tableCell}>Municipio</TableCell>
                        <TableCell sx={styles.tableCell}>Localidad</TableCell>
                        <TableCell sx={styles.tableCell}>Fecha de Beneficio</TableCell>
                        <TableCell sx={styles.tableCell}>Tipo de Beneficiario</TableCell>
                        <TableCell sx={styles.tableCell}>Tipo de Beneficio</TableCell>
                        <TableCell sx={styles.tableCell}>Cantidad de Apoyo</TableCell>
                        <TableCell sx={styles.tableCell}>Tipo de Vial</TableCell>
                        <TableCell sx={styles.tableCell}>Nombre de Vialidad</TableCell>
                        <TableCell sx={styles.tableCell}>Número Interior/Número</TableCell>
                        <TableCell sx={styles.tableCell}>Número Interior/Alfanumérico</TableCell>
                        <TableCell sx={styles.tableCell}>Nombre de la Localidad</TableCell>
                        <TableCell sx={styles.tableCell}>Clave de Localidad</TableCell>
                        <TableCell sx={styles.tableCell}>Municipio</TableCell>
                        <TableCell sx={styles.tableCell}>Clave de Municipio</TableCell>
                        <TableCell sx={styles.tableCell}>Entidad Federativa</TableCell>
                        <TableCell sx={styles.tableCell}>Clave de Entidad Federativa</TableCell>
                        <TableCell sx={styles.tableCell}>Observaciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {beneficiarios
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((beneficiario, index) => (
                          <TableRow key={index} sx={{ 
                            
                            backgroundColor: selectedBeneficiario?.curp === beneficiario.curp ? '#79142A80' : undefined,
                            '&:hover': { cursor: 'pointer', backgroundColor: '#79142A40' }
                          }}
                          onClick={() => setSelectedBeneficiario(beneficiario)}
>
                            <TableCell sx={styles.tableCell2}>{index + 1 + page * rowsPerPage}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.curp}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.primer_apellido}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.segundo_apellido}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.nombre}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.fecha_nacimiento}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_ent_nac}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.sexo}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.discapacidad}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.indigena}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_civil}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_dependencia}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_institucion}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_programa}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_intra_programa}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_ent_fed}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_municipio}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_localidad}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.fecha_beneficio}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_tipo_beneficiario}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_tipo_beneficio}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cantidad_apoyo}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.tipo_vial}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.nom_vial}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.num_int_num}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.num_int_alf}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.nom_loc}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_loc}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.nom_mun}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_mun}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.nom_ent}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.cve_ent}</TableCell>
                            <TableCell sx={styles.tableCell2}>{beneficiario.observaciones}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Container>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={beneficiarios.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Container>
              </>
            )}
          </Container>
        </div>
      </div>
      <Footer />
      <Dialog open={successDialogOpen} onClose={handleCloseSuccessDialog}>
        <DialogTitle>Carga Exitosa</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Los datos se han enviado correctamente.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      <Modal //Modal que sera utilizado para editar la informacion de los beneficiarios
      title = "Editar datos del beneficiario"
      open = {isModalVisible}
      onOk = {handleModalOk}
      onCancel = {handleModalCancel}
      okText = "Solicitar cambios"
      cancelText = "Cancelar"
      width="80%"
      confirmLoading = {loading}
      >
        <Form form = {form} layout='vertical'>
          <Form.Item
          name={"CURP"}
          label = "CURP"
          rules={[
            { 
              required: true, 
              message: 'La CURP es obligatoria' 
            },
            { 
              max: 18, 
              message: 'La CURP debe tener exactamente 18 caracteres' 
            },
            { 
              min: 18, 
              message: 'La CURP debe tener exactamente 18 caracteres' 
            },
            {
              pattern: /^[A-Z0-9]*$/,
              message: 'Solo se permiten letras mayúsculas y números'
            }
          ]}
          normalize={(value) => {
            // Convierte a mayúsculas y elimina espacios/acentos
            if (value) {
              return value.toUpperCase()
                .replace(/[^A-Z0-9]/g, '');
            }
            return value;
          }}
          >
            <Input 
              placeholder="CURP del beneficiario"
              maxLength={18}
              showCount={{
                formatter: ({ count }) => `${count}/18 caracteres`,
              }}
              allowClear
              style={{ textTransform: 'uppercase' }}
            />
            </Form.Item>


            <Form.Item
            name={"Primer apellido"}
            label = "Primer apellido"
            rules={[
              { 
                required: true, 
                message: 'El primer apellido es obligatorio' 
              },
              { 
                max: 50, 
                message: 'Máximo 50 caracteres permitidos' 
              },
              {
                pattern: /^[A-Z\s]+$/,
                message: 'Solo letras mayúsculas sin acentos'
              }
            ]}
            normalize={(value) => {
              if (value) {
                return value
                  .toUpperCase()
                  .normalize("NFD") // Separa letras de acentos
                  .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
                  .replace(/[^A-Z\s]/g, ""); // Elimina caracteres no permitidos
              }
              return value;
            }}
          >
            <Input 
              placeholder="Ingrese el primer apellido"
              maxLength={50}
              showCount={{
                formatter: ({ count }) => `${count}/50 caracteres`,
              }}
              allowClear
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>

            <Form.Item
            name={"Segundo apellido"}
            label="Segundo apellido"
            rules={[
              { 
                required: true, 
                message: 'El segundo apellido es obligatorio' 
              },
              { 
                max: 50, 
                message: 'Máximo 50 caracteres permitidos' 
              },
              {
                pattern: /^[A-Z\s]+$/,
                message: 'Solo letras mayúsculas sin acentos'
              }
            ]}
            normalize={(value) => {
              if (value) {
                return value
                  .toUpperCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^A-Z\s]/g, "");
              }
              return value;
            }}
            >
              <Input 
              placeholder="Ingrese el segundo apellido"
              maxLength={50}
              showCount={{
                formatter: ({ count }) => `${count}/50 caracteres`,
              }}
              allowClear
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>

            <Form.Item
            name={"Nombre(s)"}
            label="Nombre(s)"
            rules={[
              { 
                required: true, 
                message: 'El nombre es obligatorio' 
              },
              { 
                max: 50, 
                message: 'Máximo 50 caracteres permitidos' 
              },
              {
                pattern: /^[A-Z\s]+$/,
                message: 'Solo letras mayúsculas sin acentos'
              }
            ]}
            normalize={(value) => {
              if (value) {
                return value
                  .toUpperCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^A-Z\s]/g, "");
              }
              return value;
            }}
            >
              <Input 
              placeholder="Ingrese el nombre"
              maxLength={50}
              showCount={{
                formatter: ({ count }) => `${count}/50 caracteres`,
              }}
              allowClear
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>

            <Form.Item
            name={"Fecha de nacimiento"}
            label="Fecha de nacimiento"
            rules={[
              { 
                required: true, 
                message: 'La fecha de nacimiento es obligatoria' 
              },
              {
                pattern: /^\d{8}$/,
                message: 'Debe contener exactamente 8 dígitos (AAAAMMDD)'
              },
              {
                validator: (_, value) => {
                  if (!value || value.length !== 8) return Promise.resolve();
                  
                  const año = parseInt(value.substring(0, 4));
                  const mes = parseInt(value.substring(4, 6)) - 1; // Meses en JS son 0-11
                  const dia = parseInt(value.substring(6, 8));
                  
                  // Validar rango de años (ej. 1900-2023)
                  if (año < 1900 || año > new Date().getFullYear()) {
                    return Promise.reject('Año inválido');
                  }
                  
                  // Validar mes (1-12)
                  if (mes < 0 || mes > 11) {
                    return Promise.reject('Mes inválido (01-12)');
                  }
                  
                  // Validar día según mes
                  const fecha = new Date(año, mes, dia);
                  if (fecha.getDate() !== dia || fecha.getMonth() !== mes || fecha.getFullYear() !== año) {
                    return Promise.reject('Día inválido para este mes/año');
                  }
                  
                  // Validar que no sea fecha futura
                  if (fecha > new Date()) {
                    return Promise.reject('La fecha no puede ser futura');
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
            normalize={(value) => {
              // Elimina todo excepto números
              return value ? value.replace(/\D/g, '') : value;
            }}
          >
            <Input 
              placeholder="Ingresa la fecha de nacimiento"
              maxLength={8}
              allowClear
              onInput={(e) => {
                // Autoformato mientras escribe
                const val = e.currentTarget.value.replace(/\D/g, '');
                if (val.length > 4) {
                  e.currentTarget.value = `${val.substring(0, 4)}${val.substring(4, 6)}${val.substring(6, 8)}`;
                }
              }}
            />
          </Form.Item>

            <Form.Item
            name={"Entidad de nacimiento"}
            label="Entidad de nacimiento"
            rules={[
              { 
                required: true, 
                message: 'La entidad de nacimiento es obligatoria' 
              },
              {
                validator: (_, value) => {
                  const entidadesValidas = [
                    'AS', 'BC', 'BS', 'CC', 'CL', 'CM', 'CS', 'CH', 'DF',
                    'DG', 'GT', 'GR', 'HG', 'JC', 'MC', 'MN', 'MS', 'NT',
                    'NL', 'OC', 'PL', 'QT', 'QR', 'SP', 'SL', 'SR', 'TC',
                    'TS', 'TL', 'VZ', 'YN', 'ZS', 'NE'
                  ];
                  
                  if (!value || entidadesValidas.includes(value.toUpperCase())) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Clave de entidad no válida');
                }
              }
            ]}
            normalize={(value) => value ? value.toUpperCase().replace(/[^A-Z]/g, '') : value}
          >
            <Select
              placeholder="Seleccione la entidad"
              showSearch
              optionFilterProp="children"
              allowClear
            >
              <Select.Option value="NE">Nacido en el Extranjero</Select.Option>
              <Select.Option value="AS">Aguascalientes</Select.Option>
              <Select.Option value="BC">Baja California</Select.Option>
              <Select.Option value="BS">Baja California Sur</Select.Option>
              <Select.Option value="CC">Campeche</Select.Option>
              <Select.Option value="CL">Coahuila</Select.Option>
              <Select.Option value="CM">Colima</Select.Option>
              <Select.Option value="CS">Chiapas</Select.Option>
              <Select.Option value="CH">Chihuahua</Select.Option>
              <Select.Option value="DF">Ciudad de México</Select.Option>
              <Select.Option value="DG">Durango</Select.Option>
              <Select.Option value="GT">Guanajuato</Select.Option>
              <Select.Option value="GR">Guerrero</Select.Option>
              <Select.Option value="HG">Hidalgo</Select.Option>
              <Select.Option value="JC">Jalisco</Select.Option>
              <Select.Option value="MC">México</Select.Option>
              <Select.Option value="MN">Michoacán</Select.Option>
              <Select.Option value="MS">Morelos</Select.Option>
              <Select.Option value="NT">Nayarit</Select.Option>
              <Select.Option value="NL">Nuevo León</Select.Option>
              <Select.Option value="OC">Oaxaca</Select.Option>
              <Select.Option value="PL">Puebla</Select.Option>
              <Select.Option value="QT">Querétaro</Select.Option>
              <Select.Option value="QR">Quintana Roo</Select.Option>
              <Select.Option value="SP">San Luis Potosí</Select.Option>
              <Select.Option value="SL">Sinaloa</Select.Option>
              <Select.Option value="SR">Sonora</Select.Option>
              <Select.Option value="TC">Tabasco</Select.Option>
              <Select.Option value="TS">Tamaulipas</Select.Option>
              <Select.Option value="TL">Tlaxcala</Select.Option>
              <Select.Option value="VZ">Veracruz</Select.Option>
              <Select.Option value="YN">Yucatán</Select.Option>
              <Select.Option value="ZS">Zacatecas</Select.Option>
            </Select>
          </Form.Item>

            <Form.Item
            name={"Sexo"}
            label="Sexo"
            rules={[
              { 
                required: true, 
                message: 'El sexo es obligatorio' 
              },
              {
                pattern: /^[HM9]$/,
                message: 'Valor inválido (H: Hombre, M: Mujer, 9: No especificado)'
              }
            ]}
            normalize={(value) => value ? value.toUpperCase().replace(/[^HM9]/g, '') : value}
          >
            <Radio.Group>
              <Radio.Button value="H">Hombre</Radio.Button>
              <Radio.Button value="M">Mujer</Radio.Button>
              <Radio.Button value="9">No especificado</Radio.Button>
            </Radio.Group>
          </Form.Item>

            <Form.Item
            name={"Discapacidad"}
            label="Discacpacidad"
            rules={[
              { 
                required: true, 
                message: 'Este campo es obligatorio' 
              },
              {
                validator: (_, value) => {
                  if (value === 'SI' || value === 'NO') {
                    return Promise.resolve();
                  }
                  return Promise.reject('Debe seleccionar SI o NO');
                }
              }
            ]}
            normalize={(value) => value ? value.toUpperCase() : value}
          >
            <Radio.Group>
              <Radio.Button value="SI">Sí</Radio.Button>
              <Radio.Button value="NO">No</Radio.Button>
            </Radio.Group>
          </Form.Item>

            <Form.Item
            name={"Indigena"}
            label="Indigena"
            rules={[
              { 
                required: true, 
                message: 'Este campo es obligatorio' 
              },
              {
                validator: (_, value) => {
                  if (value === 'SI' || value === 'NO') {
                    return Promise.resolve();
                  }
                  return Promise.reject('Debe seleccionar SI o NO');
                }
              }
            ]}
            normalize={(value) => value ? value.toUpperCase() : value}
          >
            <Radio.Group>
              <Radio.Button value="SI">Sí</Radio.Button>
              <Radio.Button value="NO">No</Radio.Button>
            </Radio.Group>
          </Form.Item>

            <Form.Item
            name={"Estado civil"}
            label="Estado civil"
            rules={[
              { 
                required: true, 
                message: 'Seleccione el estado civil' 
              }
            ]}
          >
            <Select
              placeholder="Ingrese el estado civil"
              optionFilterProp="children"
              showSearch
            >
              <Select.Option value="01">UNIÓN LIBRE</Select.Option>
              <Select.Option value="02">CASADO</Select.Option>
              <Select.Option value="03">SEPARADO</Select.Option>
              <Select.Option value="04">DIVORCIADO</Select.Option>
              <Select.Option value="05">VIUDO</Select.Option>
              <Select.Option value="06">SOLTERO</Select.Option>
              <Select.Option value="09">NO CUENTA CON</Select.Option>
            </Select>
          </Form.Item>

            <Form.Item
            name={"Dependencia"}
            label="Depencencia"
            tooltip="Código numérico de 2 dígitos según catálogo de la SHCP"
            rules={[
            { 
              required: true, 
              message: 'Ingrese el código de 2 dígitos' 
            },
            {
              validator: (_, value) => {
              if (/^[0-9]{2}$/.test(value)) {
              return Promise.resolve();
            }
            return Promise.reject('Debe contener exactamente 2 dígitos');
            }
            }
            ]}
            >
            <Input 
            placeholder="Ingrese su dependencia"
            maxLength={2}
            onChange={(e) => {
            // Filtra solo números y limita a 2 dígitos
            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
            e.target.value = val;
            }}
            onBlur={(e) => {
            // Asegura 2 dígitos (agrega 0 al inicio si es necesario)
            if (e.target.value.length === 1) {
            e.target.value = `0${e.target.value}`;
            }
            }}
            />
            </Form.Item>

            <Form.Item
            name={"Institucion"}
            label="Institucion"
            rules={[
              { 
                required: true, 
                message: 'La clave de programa es obligatoria' 
              },
              {
                pattern: /^[A-Z0-9]{5}$/,
                message: 'Debe contener exactamente 5 caracteres alfanuméricos'
              }
            ]}
            normalize={(value) => {
              if (!value) return value;
              // Convierte a mayúsculas, limpia caracteres no permitidos y limita a 5
              return value.toString()
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 5);
            }}
          >
            <Input
              placeholder="Ingrese su institución"
              maxLength={5}
              style={{ 
                textTransform: 'uppercase',
                width: '100px' // Ancho reducido para 5 caracteres
              }}
              onChange={(e) => {
                // Filtra y formatea mientras escribe
                e.target.value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '')
                  .slice(0, 5);
              }}
            />
          </Form.Item>

            <Form.Item
            name={"Programa"}
            label="Programa"
            rules={[
              { 
                required: true, 
                message: 'La clave de programa es obligatoria' 
              },
              {
                pattern: /^[A-Z0-9]{4}$/,
                message: 'La clave debe tener exactamente 4 caracteres'
              }
            ]}
            normalize={(value) => value ? value.toUpperCase().replace(/[^A-Z0-9]/g, '') : value}
          >
            <Input
              placeholder="Ingrese el programa al que pertenece"
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              }}
            />
          </Form.Item>
  

            <Form.Item
            name={"Intra-programa"}
            label="Intra-programa"
            rules={[
              { 
                required: true, 
                message: 'La clave intra-programa es obligatoria' 
              },
              {
                validator: (_, value) => {
                  if (/^([0-9]{2}|XX)$/.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Debe ser 2 dígitos numéricos o "XX"');
                }
              }
            ]}
            normalize={(value) => {
              if (!value) return value;
              const str = value.toString().toUpperCase();
              // Si empieza con X, convierte a XX
              if (str.startsWith('X')) return 'XX';
              // Si no, toma solo los primeros 2 dígitos
              return str.replace(/\D/g, '').slice(0, 2);
            }}
          >
            <Input
              placeholder="Ingresa el intra-programa al que pertenece"
              maxLength={2}
              style={{ 
                width: '80px',
                textTransform: 'uppercase'
              }}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                // Si empieza con X, fuerza XX
                if (val.startsWith('X')) {
                  e.target.value = 'XX';
                } else {
                  // Si no, solo permite números
                  e.target.value = val.replace(/[^0-9]/g, '').slice(0, 2);
                }
              }}
            />
          </Form.Item>

            <Form.Item
            name={"Entidad federativa"}
            label="Entidad federativa"
            rules={[{ required: true }]}
            >
            <Select
            placeholder="Seleccione la entidad"
            options={[
            { value: 18, label: 'Nayarit' },
            { value: 99, label: 'No especificado' }
            ]}
            optionFilterProp="label"
            showSearch
            allowClear={false}
            />
            </Form.Item>

            <Form.Item
            name={"Municipio"}
            label="Municipio"
            rules={[
              { 
                required: true, 
                message: 'La clave de municipio es obligatoria' 
              },
              {
                pattern: /^[0-9]{3}$/,
                message: 'Debe ser un código numérico de 3 dígitos'
              }
            ]}
          >
            <Select
              placeholder="Seleccione municipio"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) => {
                if (!option?.label) return false;
                return String(option.label).toLowerCase().includes(input.toLowerCase());
              }}
              options={[
                { value: '001', label: 'ACAPONETA' },
                { value: '002', label: 'AHUACATLÁN' },
                { value: '003', label: 'AMATLÁN DE CAÑAS' },
                { value: '004', label: 'COMPOSTELA' },
                { value: '005', label: 'HUAJICORI' },
                { value: '006', label: 'IXTLÁN DEL RIO' },
                { value: '007', label: 'JALA' },
                { value: '008', label: 'XALISCO' },
                { value: '009', label: 'DEL NAYAR' },
                { value: '010', label: 'ROSAMORADA' },
                { value: '011', label: 'RUÍZ' },
                { value: '012', label: 'SAN BLAS' },
                { value: '013', label: 'SAN PEDRO LAGUNILLAS' },
                { value: '014', label: 'SANTA MARÍA DEL ORO' },
                { value: '015', label: 'SANTIAGO IXCUINTLA' },
                { value: '016', label: 'TECUALA' },
                { value: '017', label: 'TEPIC' },
                { value: '018', label: 'TUXPAN' },
                { value: '019', label: 'LA YESCA' },
                { value: '020', label: 'BAHÍA DE BANDERAS' },
                { value: '999', label: 'NO ESPECIFICADO' }
              ]}
            />
          </Form.Item>

            <Form.Item
            name={"Localidad"}
            label="Localidad"
            rules={[
              { 
                required: true, 
                message: 'La localidad es obligatoria' 
              }
              ]}>
              <Input placeholder='Ingresa la localidad al que pertenece'></Input>
            </Form.Item>

            <Form.Item
            name={"Fecha de beneficio"}
            label="Fecha de beneficio"
            rules={[
              { 
                required: true, 
                message: 'La fecha de beneficio es obligatoria' 
              },
              {
                pattern: /^\d{8}$/,
                message: 'Debe contener exactamente 8 dígitos (AAAAMMDD)'
              },
              {
                validator: (_, value) => {
                  if (!value || value.length !== 8) return Promise.resolve();
                  
                  const año = parseInt(value.substring(0, 4));
                  const mes = parseInt(value.substring(4, 6)) - 1; // Meses en JS son 0-11
                  const dia = parseInt(value.substring(6, 8));
                  
                  // Validar rango de años (ej. 1900-2023)
                  if (año < 1900 || año > new Date().getFullYear()) {
                    return Promise.reject('Año inválido');
                  }
                  
                  // Validar mes (1-12)
                  if (mes < 0 || mes > 11) {
                    return Promise.reject('Mes inválido (01-12)');
                  }
                  
                  // Validar día según mes
                  const fecha = new Date(año, mes, dia);
                  if (fecha.getDate() !== dia || fecha.getMonth() !== mes || fecha.getFullYear() !== año) {
                    return Promise.reject('Día inválido para este mes/año');
                  }
                  
                  // Validar que no sea fecha futura
                  if (fecha > new Date()) {
                    return Promise.reject('La fecha no puede ser futura');
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
            normalize={(value) => {
              // Elimina todo excepto números
              return value ? value.replace(/\D/g, '') : value;
            }}
          >
            <Input 
              placeholder="Ingresa la fecha de beneficio"
              maxLength={8}
              allowClear
              onInput={(e) => {
                // Autoformato mientras escribe
                const val = e.currentTarget.value.replace(/\D/g, '');
                if (val.length > 4) {
                  e.currentTarget.value = `${val.substring(0, 4)}${val.substring(4, 6)}${val.substring(6, 8)}`;
                }
              }}
            />
          </Form.Item>

            <Form.Item
            name={"Tipo de beneficiario"}
            label="Tipo de beneficiario"
            rules={[
    { 
      required: true, 
      message: 'El tipo de beneficiario es obligatorio' 
    },
    {
      pattern: /^(01|02|03|04|05|06)$/,
      message: 'Seleccione un código válido de 2 dígitos'
    }
  ]}
  normalize={(value) => {
    if (!value) return '01'; // Valor por defecto (opcional)
    // Convierte a string y toma los primeros 2 dígitos
    const digits = value.toString().replace(/\D/g, '').slice(0, 2);
    return digits.padStart(2, '0'); // Asegura 2 dígitos
  }}
>
  <Select
    placeholder="Seleccione el tipo"
    allowClear={false}
    options={[
      { value: '01', label: 'BENEFICIARIO DIRECTO' },
      { value: '02', label: 'BENEFICIARIO INDIRECTO' },
      { value: '03', label: 'DERECHOHABIENTE TITULAR/ASEGURADO' },
      { value: '04', label: 'DERECHOHABIENTE CONYUGUE/CONCUBINARIO' },
      { value: '05', label: 'DERECHOHABIENTE FAMILIAR' },
      { value: '06', label: 'DERECHOHABIENTE PENSIONADO' }
    ]}
    optionFilterProp="label"
    showSearch
    filterOption={(input, option) => 
      option?.label?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
    }
  />
</Form.Item>

            <Form.Item
            name={"Tipo de beneficio"}
            label='Tipo de beneficio'
            rules={[
    { 
      required: true, 
      message: 'El tipo de beneficio es obligatorio' 
    },
    {
      pattern: /^(001|002|003|004|005|006)$/,
      message: 'Seleccione un código válido de 3 dígitos'
    }
  ]}
  normalize={(value) => {
    if (!value) return '001';
    const digits = value.toString().replace(/\D/g, '').slice(0, 3);
    return digits.padStart(3, '0');
  }}
>
  <Select
    placeholder="Seleccione el tipo"
    allowClear={false}
    options={[
      { value: '001', label: 'MONETARIO' },
      { value: '002', label: 'ESPECIE' },
      { value: '003', label: 'SERVICIO' },
      { value: '004', label: 'MIXTO' },
      { value: '005', label: 'PRODUCTO SUBSIDIADO' },
      { value: '006', label: 'INDIRECTO' }
    ]}
    optionFilterProp="label"
    showSearch
    filterOption={(input, option) => 
      option?.label?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
    }
  />
</Form.Item>

            <Form.Item
            name={"Cantidad de apoyo"}
            label="Cantidad de apoyo"
            rules={[
    { 
      required: true, 
      message: 'Ingrese el monto de apoyo' 
    },
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: 'Formato inválido (ejemplo: 1250.50)'
    }
  ]}
>
  <Input
    placeholder="Ingrese la cantidad de apoyo"
    prefix="$"
    onChange={(e) => {
      // Permite solo números y un punto decimal
      const val = e.target.value
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1'); // Solo un punto
      e.target.value = val;
    }}
    onBlur={(e) => {
      // Formatea a 2 decimales
      if (e.target.value && !e.target.value.includes('.')) {
        e.target.value = `${e.target.value}.00`;
      }
    }}
    style={{ width: '150px' }}
  />
</Form.Item>
            
            <Form.Item
            name={"Tipo de vial"}
            label="Tipo de vial"
            rules={[
    { 
      required: true, 
      message: 'El tipo de vialidad es obligatorio' 
    },
    {
      max: 255,
      message: 'Máximo 255 caracteres permitidos'
    }
  ]}
  normalize={(value) => value ? value.toString().toUpperCase().trim() : value}
>
  <Input
    placeholder="Ingrese el tipo de vialidad"
    maxLength={255}
    showCount={{
      formatter: ({ count }) => `${count}/255 caracteres`,
    }}
    style={{ textTransform: 'uppercase' }}
    allowClear
    onChange={(e) => {
      // Convierte a mayúsculas mientras escribe
      e.target.value = e.target.value.toUpperCase();
    }}
  />
</Form.Item>

            <Form.Item
            name={"Nombre de Vialidad"}
            label="Nombre de vialidad"
            rules={[
    { 
      required: true, 
      message: 'El nombre de vialidad es obligatorio' 
    },
    {
      max: 255,
      message: 'Máximo 255 caracteres permitidos'
    }
  ]}
  normalize={(value) => value ? value.toString().toUpperCase().trim() : value}
>
  <Input
    placeholder="Ingrese el nombre de vialidad"
    maxLength={255}
    showCount={{
      formatter: ({ count }) => `${count}/255 caracteres`,
    }}
    style={{ textTransform: 'uppercase' }}
    allowClear
    onChange={(e) => {
      e.target.value = e.target.value.toUpperCase();
    }}
  />
</Form.Item>

            <Form.Item
            name={"Numero de vialidad / Numero"}
            label="Numero de vialidad / Numero"
            rules={[
              { 
                required: true, 
                message: 'El número de vialidad es obligatorio (use 0 si no aplica)' 
              },
              {
                validator: (_, value) => {
                  if (/^[0-9]{1,5}$/.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Máximo 5 dígitos (use 0 si no aplica)');
                }
              }
            ]}
          >
            <Input
              placeholder="0 (si no aplica)"
              maxLength={5}
              onChange={(e) => {
                // Filtra solo números y reemplaza vacío por 0
                const val = e.target.value.replace(/\D/g, '') || '0';
                e.target.value = val.slice(0, 5);
              }}
              onBlur={(e) => {
                // Asegura que no quede vacío
                if (e.target.value === '') {
                  e.target.value = '0';
                }
              }}
              style={{ width: '120px' }}
            />
          </Form.Item>

            <Form.Item
            name={"Numero de vialidad / Alfanumérico"}
            label="Numero de vialidad / Alfanumérico"
            rules={[
              {
                max: 35,
                message: 'Máximo 35 caracteres permitidos'
              }
            ]}
            normalize={(value) => value ? value.toString().toUpperCase().trim() : value}
          >
            <Input
              placeholder="Ingrese el número de vialidad / Alfanumérico"
              maxLength={35}
              showCount={{
                formatter: ({ count }) => `${count}/35 caracteres`,
              }}
              style={{ textTransform: 'uppercase' }}
              allowClear
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
          </Form.Item>

            <Form.Item
            name={"Localidad"}
            label="Localidad"
            rules={[
              { 
                required: true, 
                message: 'El nombre de localidad es obligatorio' 
              },
              {
                max: 255,
                message: 'Máximo 255 caracteres permitidos'
              }
            ]}
            normalize={(value) => value ? value.toString().toUpperCase().trim() : value}
          >
            <Input
              placeholder="Ingrese el nombre de la localidad"
              maxLength={255}
              showCount={{
                formatter: ({ count }) => `${count}/255 caracteres`,
              }}
              style={{ textTransform: 'uppercase' }}
              allowClear
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
          </Form.Item>

            <Form.Item
            name={"Clave de localidad"}
            label="Clave de localidad"
            rules={[
              { 
                required: true, 
                message: 'La clave de localidad es obligatoria' 
              },
              {
                max: 4,
                message: 'Máximo 4 caracteres permitidos'
              }
            ]}
            normalize={(value) => value ? value.toString().toUpperCase().trim() : value}
          >
            <Input
              placeholder="Ingrese la clave de localidad"
              maxLength={4}
              showCount={{
                formatter: ({ count }) => `${count}/4 caracteres`,
              }}
              style={{ textTransform: 'uppercase' }}
              allowClear
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
          </Form.Item>

          <Form.Item
            name={"Municipio"}
            label="Municipio"
            rules={[
              { 
                required: true, 
                message: 'El nombre de municipio es obligatorio' 
              },
              {
                max: 255,
                message: 'Máximo 255 caracteres permitidos'
              }
            ]}
            normalize={(value) => value ? value.toString().toUpperCase().trim() : value}
          >
            <Input
              placeholder="Ingrese el nombre del municipio"
              maxLength={255}
              showCount={{
                formatter: ({ count }) => `${count}/255 caracteres`,
              }}
              style={{ textTransform: 'uppercase' }}
              allowClear
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
          </Form.Item>

            <Form.Item
            name={"Clave de municipio"}
            label="Clave de municipio"
            rules={[
              { 
                required: true, 
                message: 'La clave de municipio es obligatoria' 
              },
              {
                max: 3,
                message: 'Máximo 3 caracteres permitidos'
              }
            ]}
            normalize={(value) => value ? value.toString().toUpperCase().trim() : value}
          >
            <Input
              placeholder="Ingrese la clave de municipio"
              maxLength={3}
              showCount={{
                formatter: ({ count }) => `${count}/3 caracteres`,
              }}
              style={{ textTransform: 'uppercase' }}
              allowClear
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
          </Form.Item>

            <Form.Item
            name={"Entidad federativa"}
            label="Entidad federativa"
            rules={[
              { 
                required: true, 
                message: 'El nombre de entidad federativa es obligatorio' 
              },
              {
                max: 255,
                message: 'Máximo 255 caracteres permitidos'
              }
            ]}
            normalize={(value) => value ? value.toString().toUpperCase().trim() : value}
          >
            <Input
              placeholder="Ingrese el nombre de la entidad"
              maxLength={255}
              showCount={{
                formatter: ({ count }) => `${count}/255 caracteres`,
              }}
              style={{ textTransform: 'uppercase' }}
              allowClear
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
          </Form.Item>

            <Form.Item
            name={"Clave de entidad federativa"}
            label="Clave de entidad federativa"
            rules={[
              { 
                required: true, 
                message: 'La clave de entidad es obligatoria' 
              },
              {
                max: 2,
                message: 'Máximo 2 caracteres permitidos'
              }
            ]}
            normalize={(value) => value ? value.toString().toUpperCase().trim() : value}
          >
            <Input
              placeholder="Ingrese la clave de la entidad"
              maxLength={2}
              showCount={{
                formatter: ({ count }) => `${count}/2 caracteres`,
              }}
              style={{ textTransform: 'uppercase' }}
              allowClear
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
          </Form.Item>

            <Form.Item
            name={"Observaciones"}
            label="Observaciones"
            >
              <Input  placeholder='Ingresa las observaciones correspondientes'></Input>
            </Form.Item>
          </Form>    
      </Modal>

    </div>
  );
};

export default Carga;

const styles = {
  tableCell: {
    backgroundColor: '#60595D',
    color: 'white',
    fontSize: '1rem',
    fontFamily: 'gothamrnd_medium',
    borderRight: '1px solid #ffffff',
    borderBottom: '2px solid #ffffff',
  },

  tableCell2: {
    borderBottom: '1px outset #d3d3d3',
    borderRight: '1px outset #d3d3d3',
    fontFamily: 'gothamrnd_medium'
  },
  selectedRow: {
    backGroundColor:'#a6b9c3 !important',
    '& td': { color: 'white !important' }
  },
  actionButtons: {
    marginTop: '16px',
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  }
};