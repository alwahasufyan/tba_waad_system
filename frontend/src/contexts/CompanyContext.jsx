import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

// action types
const SET_EMPLOYER = 'SET_EMPLOYER';
const CLEAR_EMPLOYER = 'CLEAR_EMPLOYER';
const INITIALIZE = 'INITIALIZE';

// initial state
const initialState = {
  selectedEmployerId: null,
  selectedEmployerName: null,
  isInitialized: false
};

// ==============================|| EMPLOYER REDUCER ||============================== //

const companyReducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE:
      return {
        ...state,
        selectedEmployerId: action.payload.employerId,
        selectedEmployerName: action.payload.employerName,
        isInitialized: true
      };
    case SET_EMPLOYER:
      return {
        ...state,
        selectedEmployerId: action.payload.employerId,
        selectedEmployerName: action.payload.employerName
      };
    case CLEAR_EMPLOYER:
      return {
        ...state,
        selectedEmployerId: null,
        selectedEmployerName: null
      };
    default:
      return state;
  }
};

// ==============================|| EMPLOYER CONTEXT ||============================== //

const CompanyContext = createContext(null);

export const CompanyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(companyReducer, initialState);

  useEffect(() => {
    // Initialize from localStorage
    const storedEmployerId = localStorage.getItem('selectedEmployerId');
    const storedEmployerName = localStorage.getItem('selectedEmployerName');

    dispatch({
      type: INITIALIZE,
      payload: {
        employerId: storedEmployerId ? parseInt(storedEmployerId, 10) : null,
        employerName: storedEmployerName
      }
    });
  }, []);

  const setCompany = (employerId, employerName) => {
    if (employerId) {
      localStorage.setItem('selectedEmployerId', employerId.toString());
      localStorage.setItem('selectedEmployerName', employerName || '');
    } else {
      localStorage.removeItem('selectedEmployerId');
      localStorage.removeItem('selectedEmployerName');
    }

    dispatch({
      type: SET_EMPLOYER,
      payload: { employerId, employerName }
    });

    // Trigger global refresh event
    window.dispatchEvent(new CustomEvent('employerChanged', { detail: { employerId, employerName } }));
  };

  const clearCompany = () => {
    localStorage.removeItem('selectedEmployerId');
    localStorage.removeItem('selectedEmployerName');

    dispatch({ type: CLEAR_EMPLOYER });

    // Trigger global refresh event
    window.dispatchEvent(new CustomEvent('employerChanged', { detail: { employerId: null, employerName: null } }));
  };

  return (
    <CompanyContext.Provider
      value={{
        ...state,
        setCompany,
        clearCompany
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

CompanyProvider.propTypes = {
  children: PropTypes.node
};

export default CompanyContext;
