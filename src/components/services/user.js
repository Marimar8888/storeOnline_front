import axios from 'axios';

import { API_URL } from '../utils/constant';

export const getUserIdFromAPI = (token) => {

    return axios.get(`${API_URL}/get_user_id`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then(response => {
            if (response.status === 200) {
                return response.data.users_id;
            } else {
                console.log("No Authorization");
                return null;
            }
        })
        .catch(error => {
            if (error.response) {
                console.log(`Error: ${error.response.status} - ${error.response.statusText}`);
                console.log(error.response.data);
            } else {
                console.log("Network or other error:", error.message);
            }
            return null;
        });
};

export const getUserRolsFromAPI = (userId, token) => {
    return axios.get(`${API_URL}/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            if (response.status === 200) {
                const rols = response.data.rols;
                const studentRole = rols.find(rol => rol.rols_id === 2);
                const professorRole = rols.find(rol => rol.rols_id === 3);

                return {
                    rols,
                    studentRole,
                    professorRole
                };
            } else {
                return {
                    rols: [],
                    studentRole: null,
                    professorRole: null
                };
            }
        })
        .catch(error => {
            return {
                rols: [],
                studentRole: null,
                professorRole: null
            };
        });
};


export const updatePassword = (userId, resetToken, password, setErrorText, setMessage) => {
    return axios.patch(`${API_URL}/user/${userId}`,
        {
            users_password: password,
        },
        {
            headers: {
                Authorization: `Bearer ${resetToken}`
            }
        }
    )
        .then(response => {
            return response;
        })
        .catch(error => {
            if (error.response) {
                if (error.response.status === 401) {
                    if (error.response.data.error === 'Token has expired') {
                        setErrorText("El token ha expirado. Solicite un nuevo enlace de restablecimiento.");
                    } else {
                        setErrorText("Error de autorización. Verifique su token.");
                    }
                } else {
                    setErrorText("Error al cambiar la contraseña");
                }
            } else {
                setErrorText("Error al cambiar la contraseña");
            }
            setMessage("");
        });
};


export const sendEmailChangePassword = (email) => {
    return axios.post(`${API_URL}/forgot-password`,
        { users_email: email }
    )
        .then(response => {
            return response;
        })
        .catch(error => {
            console.log("error sendEmailChangePassword:", error);
        });
};

export const login = (email, password, setErrorText, handleUnsuccessfulAuth) => {
    return axios.post(`${API_URL}/login`,
        {
            users_email: email,
            users_password: password
        }
    )
        .then(response => {
            return response;
        })
        .catch(error => {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        setErrorText(error.response.data.error);
                        break;
                    case 404:
                        setErrorText("Usuario no encontrado");
                        break;
                    case 401:
                        setErrorText("Password incorrecto");
                        break;
                    default:
                        setErrorText("Error inesperado. Inténtelo de nuevo.");
                }
            } else if (error.request) {
                setErrorText("Error inexperado. Revise su conexión.");
            } else {
                setErrorText("Error al procesar la petición. Inténtelo de nuevo.");
            }
            handleUnsuccessfulAuth();
        });
};


export const addUser = (name, email, password, setState, isMountedComponent) => {
    return axios.post(`${API_URL}/user`,
        {
            users_name: name,
            users_email: email,
            users_password: password
        }
    )
        .then(response => {
            return response;
        })
        .catch(error => {
            if (isMountedComponent) {
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            setState({
                                errorText: error.response.data.error
                            });
                            break;
                        case 404:
                            setState({
                                errorText: "A required resource could not be found on the server."
                            });
                            break;
                        case 500:
                            setState({
                                errorText: "Server error. Please try again later."
                            });
                            break;
                        default:
                            setState({
                                errorText: "Unexpected error. Please try again."
                            });

                    }
                } else if (error.request) {
                    if (isMountedComponent) {
                        setState({
                            errorText: "A response could not be obtained from the server. Check your internet connection."
                        });
                    }
                } else {
                    if (isMountedComponent) {
                        setState({
                            errorText: "An error occurred while processing the request. Please try again."
                        });
                    }
                }
            }
        });
};








