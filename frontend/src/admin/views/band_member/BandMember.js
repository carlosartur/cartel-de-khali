import { CAlert, CButton, CButtonGroup, CCard, CCardBody, CCardHeader, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CRow, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CToaster, CToastClose, CToastBody, CToast } from '@coreui/react';
import api from "../../../api/api";
import React, { useEffect, useRef, useState } from 'react';
import { CFormInputWithMask } from '../../../components/CFormInputWithMask';
import { PaginationFromData } from '../../../components/PaginationComponent';
import * as icon from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { AuthComponent } from '../../../components/AuthComponent';
import { Caret } from '../../../components/Caret';
import { handleCsvExport } from '../../../utils/exportcsv';

const SearchResultsTable = searchResponse => {
  const { searchResults, onClickPagination, onClickDelete } = searchResponse;

  if (!searchResults.total) {
    return (
      <CAlert color="warning">Nenhuma BandMember econtrada</CAlert>
    );
  }

  return (
    <>
      <CTable striped hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>

                           <CTableHeaderCell scope="col">name</CTableHeaderCell>
                         <CTableHeaderCell scope="col">position</CTableHeaderCell>
                         <CTableHeaderCell scope="col">description</CTableHeaderCell>
                         <CTableHeaderCell scope="col">gallery_id</CTableHeaderCell>
                            <CTableHeaderCell 
              scope="col"
              style={{ width: '150px'}}
              onClick={ () => onClickSort("created_at") }
            >
              Criado em
              <Caret sortData={sortData} columnName="created_at"></Caret>
            </CTableHeaderCell>
            <CTableHeaderCell 
              scope="col"
              style={{ width: '150px'}}
              onClick={ () => onClickSort("updated_at") }
            >
              Atualizado em
              <Caret sortData={sortData} columnName="updated_at"></Caret>
            </CTableHeaderCell>
            <CTableHeaderCell scope="col">Ações</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>

          {searchResults.data.map((item, index) => <CTableRow key={index}>
            <CTableHeaderCell scope="row">{item.id}</CTableHeaderCell>
            
                           <CTableDataCell>{item.name}</CTableDataCell>
                         <CTableDataCell>{item.position}</CTableDataCell>
                         <CTableDataCell>{item.description}</CTableDataCell>
                         <CTableDataCell>{item.gallery_id}</CTableDataCell>
                            <CTableDataCell><BrazilianFormatData date={item.created_at}/></CTableDataCell>
            <CTableDataCell><BrazilianFormatData date={item.updated_at}/></CTableDataCell>
            <CTableDataCell>              
              <CButtonGroup role="group" aria-label="Ações de BandMember">
                <CButton color="primary" href={`#/admin/band_member-form?id=${item.id}`}><CIcon icon={icon.cilPencil} size="lg"/></CButton>
                
                <CButton 
                  color="danger" 
                  onClick={() => onClickDelete({
                    id: item.id,
                    visible: true,
                    name: item.name,
                  })}
                  
                >
                  <CIcon icon={icon.cilTrash} size="lg"/>
                </CButton>
              </CButtonGroup>
            </CTableDataCell>
            
          </CTableRow>)}

        </CTableBody>
      </CTable>
      <PaginationFromData searchResults={searchResults} clickFunction={onClickPagination}></PaginationFromData>
    </>
  );
}

const BandMember = () => {
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [toastContent, setToastContent] = useState(false);
  const toaster = useRef();

  const [deleteModalData, setDeleteModalData] = useState({
    visible: false,
    name: '',
    id: 0
  });

  const [currentSetOrdering, setCurrentSetOrdering] = useState({
    order_by: 'id',
    order_by_direction: 'asc',
  });

  const [searchResults, setSearchResults] = useState([]);
  
  const lauchToast = toastData => {
    const toastInternal = (<CToast autohide={false} visible={toastData.visible} color={toastData.color} className="text-white align-items-center">
        <div className="d-flex">
          <CToastBody>{toastData.message}</CToastBody>
          <CToastClose className="me-2 m-auto" white />
        </div>
      </CToast>)
    
    setToastContent(toastInternal);
  };

  const [formData, setFormData] = useState({
           name: '',
         position: '',
         description: '',
         gallery_id: '',
            order_by: 'id',
    order_by_direction: 'asc',
  });

  const orderOnClick = (orderField) => {
    const currentOrderDirection = formData.order_by != orderField
      ? 'asc'
      : (
        formData.order_by_direction == 'asc' 
          ? 'desc' 
          : 'asc'
        );

    setFormData({
      ...formData, 
      order_by: orderField,
      order_by_direction: currentOrderDirection, 
    });

  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    if(e) {
      e.preventDefault();
    }

    setLoading(true);

    try {
      const response = await api.get(`${process.env.REACT_APP_API_URL}/admin/band_member`, {
        params: formData,
      });
      setSearchResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
    }
  };

  const csvExport = async (e) => {
    if(e) {
      e.preventDefault();
    }

    return handleCsvExport(
      formData,
      lauchToast,
      setCsvLoading,  
      `${process.env.REACT_APP_API_URL}/admin/band_member/export-to-csv`
    );

  };

  const makePageRequest = async (e) => {
    const linkpaginacao = e.target.getAttribute('linkpaginacao');

    try {
      const response = await api.get(linkpaginacao);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
    }
  };

  const deleteBandMember = async band_memberId => {
    try {
      const response = await api.delete(`${process.env.REACT_APP_API_URL}/admin/band_member`, {
        params: { id: band_memberId },
      });

      lauchToast({
        message: 'Excluído com sucesso!',
        color: 'success',
        visible: true,
      });

      handleSubmit();
    } catch (error) {
      console.error(error);

      lauchToast({
        message: 'Falha na exclusão de BandMember.',
        color: 'danger',
        visible: true,
      });

      handleSubmit();
    }

  };
  
  useEffect(() => {
    handleSubmit();
  }, []);

  useEffect(() => {
    if (
      formData.order_by === currentSetOrdering.order_by &&
      formData.order_by_direction === currentSetOrdering.order_by_direction
    ) {
      return;
    }

    setCurrentSetOrdering({
      order_by: formData.order_by,
      order_by_direction: formData.order_by_direction,
    });

    handleSubmit();
  }, [formData]);

  return (
    <>
      <AuthComponent/>

      <CToaster ref={toaster} placement="top-end" push={toastContent}></CToaster>

      <CModal alignment="center" visible={deleteModalData.visible} onClose={() => setDeleteModalData({visible: false})}>
        <CModalHeader>
          <CModalTitle>Excluir BandMember {deleteModalData.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Tem certeza que deseja excluir a BandMember {deleteModalData.name}? Essa ação não pode ser desfeita!
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalData({visible: false})}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={() => {
            deleteBandMember(deleteModalData.id);
            setDeleteModalData({visible: false});
          }}>Excluir</CButton>
        </CModalFooter>
      </CModal>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CForm onSubmit={handleSubmit} className="g-3">  
              <CCardHeader>
                <strong>BandMember</strong> <small>Busca</small>
              </CCardHeader>
              <CCardBody className='row'>
              
                              <CCol xs={4}>
                  <CFormLabel htmlFor="id">id</CFormLabel>
                  <CFormInput 
                    value={formData.id} 
                    onChange={handleChange} 
                    id="id"
                    name="id">
                  </CFormInput>
                </CCol>
                              <CCol xs={4}>
                  <CFormLabel htmlFor="name">name</CFormLabel>
                  <CFormInput 
                    value={formData.name} 
                    onChange={handleChange} 
                    id="name"
                    name="name">
                  </CFormInput>
                </CCol>
                              <CCol xs={4}>
                  <CFormLabel htmlFor="position">position</CFormLabel>
                  <CFormInput 
                    value={formData.position} 
                    onChange={handleChange} 
                    id="position"
                    name="position">
                  </CFormInput>
                </CCol>
                              <CCol xs={4}>
                  <CFormLabel htmlFor="description">description</CFormLabel>
                  <CFormInput 
                    value={formData.description} 
                    onChange={handleChange} 
                    id="description"
                    name="description">
                  </CFormInput>
                </CCol>
                              <CCol xs={4}>
                  <CFormLabel htmlFor="gallery_id">gallery_id</CFormLabel>
                  <CFormInput 
                    value={formData.gallery_id} 
                    onChange={handleChange} 
                    id="gallery_id"
                    name="gallery_id">
                  </CFormInput>
                </CCol>
                              <CCol xs={4}>
                  <CFormLabel htmlFor="created_at">created_at</CFormLabel>
                  <CFormInput 
                    value={formData.created_at} 
                    onChange={handleChange} 
                    id="created_at"
                    name="created_at">
                  </CFormInput>
                </CCol>
                              <CCol xs={4}>
                  <CFormLabel htmlFor="updated_at">updated_at</CFormLabel>
                  <CFormInput 
                    value={formData.updated_at} 
                    onChange={handleChange} 
                    id="updated_at"
                    name="updated_at">
                  </CFormInput>
                </CCol>
              
              </CCardBody>

              <CCardFooter>
                <CCol xs={12} align="right">
                  <CButtonGroup role="group" aria-label="Ações de BandMember">
                    <CButton type="submit" disabled={loading}>
                      {loading ? (
                        <CSpinner component="span" size="sm" aria-hidden="true" />
                      ): (
                        <CIcon icon={icon.cilZoom} size="lg"/>
                      )}
                      &nbsp;
                      Buscar
                    </CButton>
                    <CButton type="button" color='dark' disabled={csvLoading} onClick={csvExport}>
                      {csvLoading ? (
                        <CSpinner component="span" size="sm" aria-hidden="true" />
                      ): (
                        <CIcon icon={icon.cilSpreadsheet}/>
                      )}
                      &nbsp;
                      Exportar planilha
                    </CButton>
                    <CButton href='#/admin/band_member-form' color="success">
                      <CIcon icon={icon.cilPlus} size="lg"/>
                      &nbsp;
                      Adicionar
                    </CButton>
                  </CButtonGroup>
                </CCol>

              </CCardFooter>
            </CForm>
          </CCard>
        </CCol>

        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Resultados</strong> <small>Busca</small>
            </CCardHeader>
            <CCardBody>
              <SearchResultsTable 
                searchResults={searchResults} 
                onClickPagination={makePageRequest} 
                onClickDelete={setDeleteModalData}
                onClickSort={orderOnClick}
                sortData={formData}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
};

export default BandMember