import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Appointments.css';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import SignaturePad from './SignaturePad';

const Appointments = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const branchId = parseInt(params.get('branch_id')) || 0;
  const isAdmin = branchId === 0;

  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [fetchedAppointments, setFetchedAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [additionalWorks, setAdditionalWorks] = useState([]);

  const detailsFormRef = useRef(null);

  const handleConfirmYes = async () => {
    setShowArrivalModal(false);
    setShowDetailsModal(true);
  };

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments`, {
        params: { branch_id: branchId, appointment_date: date },
      });
      setFetchedAppointments(res.data);
    } catch (err) {
      console.error('❌ Error fetching appointments', err);
      setFetchedAppointments([]);
    }
  }, [branchId, date]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (showDetailsModal) {
      requestAnimationFrame(() => {
        if (detailsFormRef.current) {
          detailsFormRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
      });
    }
  }, [showDetailsModal]);

  const changeDateBy = (days) => {
    const current = new Date(date);
    current.setDate(current.getDate() + days);
    setDate(current.toISOString().split('T')[0]);
  };

  const handleDateChange = (e) => setDate(e.target.value);

  const handleRowClick = (appt) => {
    setSelectedAppointment(appt);
    setShowArrivalModal(true);
    setAdditionalWorks([]);
  };

  const handleCellClick = (e) => {
    const el = e.currentTarget;
    el.classList.toggle('expanded');
    setTimeout(() => el.classList.remove('expanded'), 3000);
  };

  const handleAddWork = () => {
    setAdditionalWorks([...additionalWorks, '']);
  };

  const handleWorkChange = (index, value) => {
    const updated = [...additionalWorks];
    updated[index] = value;
    setAdditionalWorks(updated);
  };

  return (
    <div className="appointments-container" dir="rtl">
      <h2>רשימת רכבים צבאיים לתאריך</h2>

      <div className="date-controls">
        <button onClick={() => changeDateBy(1)}>🔼</button>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="date-input"
          onKeyDown={(e) => e.preventDefault()}
        />
        <button onClick={() => changeDateBy(-1)}>🔽</button>
      </div>

      <div className="appointments-content">
        <div className="appointments-table">
          <div className="table-header">
            <div>מס' פניה</div>
            <div>שעה</div>
            <div>מספר רכב</div>
            <div>שם נהג</div>
            <div>{isAdmin ? 'פנצריה' : "טל' נהג"}</div>
          </div>

          <div className="table-body" dir="rtl">
            {[...fetchedAppointments, ...Array(Math.max(8 - fetchedAppointments.length, 0)).fill(null)].map((appt, idx) => {
              const isCompleted = appt?.AppointmentActualSet === 1;
              const isEmpty = !appt;
              const rowClass = isEmpty ? 'table-row empty-row' : (isCompleted ? 'table-row completed-row' : 'table-row');

              return (
                <div
                  key={idx}
                  className={rowClass}
                  onClick={() => {
                    if (appt && !isCompleted) handleRowClick(appt);
                  }}
                  style={{
                    cursor: appt && !isCompleted ? 'pointer' : 'default',
                    backgroundColor: appt ? (idx % 2 === 0 ? '#fff' : '#f9f9f9') : '#fff'
                  }}
                >
                  <div className="cell" data-full={appt?.AppointmentID || ''} onClick={appt ? handleCellClick : undefined}>
                    {appt?.AppointmentID || ''}
                  </div>
                  <div className="cell" data-full={appt?.AppointmentTime?.slice(0, 5) || ''} onClick={appt ? handleCellClick : undefined}>
                    {appt?.AppointmentTime?.slice(0, 5) || ''}
                  </div>
                  <div className="cell" data-full={appt?.CarNum || ''} onClick={appt ? handleCellClick : undefined}>
                    {appt?.CarNum || ''}
                  </div>
                  <div className="cell" data-full={appt?.DriverName || ''} onClick={appt ? handleCellClick : undefined}>
                    {appt?.DriverName || ''}
                  </div>
                  <div className={`cell ${isAdmin ? '' : 'phone-column'}`} data-full={isAdmin ? (appt?.Name || '') : (appt?.DriverPhone || '')} onClick={appt ? handleCellClick : undefined}>
                    {isAdmin ? (appt?.Name || '') : (appt?.DriverPhone || '')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showArrivalModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-question">האם הגיע לטיפול?</h3>
            <div className="modal-buttons">
              <button className="yes" onClick={handleConfirmYes}>כן</button>
              <button className="no" onClick={() => setShowArrivalModal(false)}>לא</button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="details-modal-box">
            <div className="details-modal-header">
              מספר פניה - {selectedAppointment.AppointmentID}
            </div>
            <div className="details-form-wrapper">
              <div className="details-form" ref={detailsFormRef}>
                {[{ label: 'מספר רכב', value: selectedAppointment.CarNum },
                { label: 'סוג רכב', value: selectedAppointment.TypeOfCar },
                { label: 'נהג', value: selectedAppointment.DriverName },
                { label: 'קילומטר', value: Number(selectedAppointment.Kil) },
                { label: 'פעולה לביצוע', value: selectedAppointment.WorkTypeDes },
                { label: 'כמות', value: selectedAppointment.MikomDes ? selectedAppointment.MikomDes.split(',').filter(m => m.trim() !== '').length : 0 }
                ].map((field, idx) => (
                  <div className="details-row" key={idx}>
                    <label>{field.label}</label>
                    <input value={field.value || ''} readOnly />
                  </div>
                ))}

                {selectedAppointment.MikomDes?.split(',').map((mikom, index) => (
                  <div className="details-row" key={`mikom-${index}`}>
                    <label>מיקום - {index + 1}</label>
                    <input value={mikom.trim()} readOnly />
                  </div>
                ))}

                {additionalWorks.map((work, index) => (
                  <div className="details-row" key={`extra-work-${index}`}>
                    <label>פעולה נוספת - {index + 1}</label>
                    <input
                      value={work}
                      onChange={(e) => handleWorkChange(index, e.target.value)}
                      placeholder="תאר את הפעולה שבוצעה"
                    />
                  </div>
                ))}

                <button className="add-work-button" type="button" onClick={handleAddWork}>
                  ➕ הוסף פעולה נוספת
                </button>
              </div>
            </div>

            <button className="sign-button" onClick={() => setShowSignatureModal(true)}>
              חתימה
            </button>
          </div>
        </div>
      )}

      {showSignatureModal && (
        <div className="modal-overlay">
          <SignaturePad
            onCancel={() => setShowSignatureModal(false)}
            onConfirm={async (signatureBase64) => {
              try {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/set-signature`, {
                  AppointmentID: selectedAppointment.AppointmentID,
                  Signeture: signatureBase64,
                });
                await fetchAppointments();
                setShowSignatureModal(false);
                setShowDetailsModal(false);
              } catch (err) {
                console.error('❌ Error saving signature', err);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Appointments;
