import axios from 'axios';
import { API_URL } from '../utils/constant';

export const studyCentersNamesFromAPI = (professorId, token) => {
    const url = `${API_URL}/centers/professor/${professorId}`;
    return axios
        ({
            method: "get",
            url: url,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log("error studyCentersNamesFromAPI:", error);
        });

};

export const updateCreateCenter = ({ methodAPI, urlAPI,  token, state, studyCenterUserId }) => {
    const centerFormData = buildForm({ state, studyCenterUserId });
    return axios
        ({
            method: methodAPI,
            url: urlAPI,
            data: centerFormData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            state.setState({
                studyCenters_id: "",
                studyCenters_name: "",
                studyCenters_email: "",
                studyCenters_user_id: studyCenterUserId || "",
                studyCenters_cif: "",
                studyCenters_address: "",
                studyCenters_city: "",
                studyCenters_postal: "",
                studyCenters_number_card: "",
                studyCenters_exp_date: "",
                studyCenters_cvc: "",
                studyCenters_active: true,
                methodAPI: "post",
                urlAPI: `${API_URL}/studycenter`,
                isButtonEnabled: false,
            });
            return response;
        })
        .catch(error => {
            console.log("error handleSubmit", error);
        })
};

export const studyCentersByUserIdFromAPI = (userId, token) => {
    const url = `${API_URL}/studycenter/user_id/${userId}`;
    return axios
        ({
            method: "get",
            url: url,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log("error studyCentersNamesFromAPI:", error);
        });

};

export const handleChangeStatusCenterFromApi=(center, token, statusCenter)=> {
    
    return axios({
      method: 'patch',
      url: `${API_URL}/studycenter/status/${center.studyCenters_id}`,
      data: {
        studyCenters_active: statusCenter
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(response => {
        return response
      })
      .catch(error => {
        console.log("error handleChangeStatusCenter", error)
      })
  };

export const AddCenterWorkClicFromApi = (professorId, studycenterId, token) => {
    return axios({
        method: 'post',
        url: `${API_URL}/professor_studycenter`,
        data: {
            professor_id: professorId,
            studyCenter_id: studycenterId
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
        .then(response => {
          return response;
        })
        .catch(error => {
            if (error.response) {
                if (error.response.status === 404) {
                  const errorMessage = error.response.data.error;
                  return Promise.reject(new Error(errorMessage)); 
                } else if (error.response.status === 400) {
                  const errorMessage = error.response.data.error;
                  return Promise.reject(new Error(errorMessage));
                } else {
                  return Promise.reject(new Error('An unexpected error occurred'));
                }
              } else {
                return Promise.reject(new Error('Network error or server not reachable'));
              }
        });
};


/*----------- BuilderForm ----------- */

export const buildForm = ({ state, studyCenterUserId}) => {
    let centerFormData = new FormData();

    const fields = [
      "studyCenters_name",
      "studyCenters_email",
      "studyCenters_cif",
      "studyCenters_address",
      "studyCenters_city",
      "studyCenters_postal",
      "studyCenters_number_card",
      "studyCenters_exp_date",
      "studyCenters_cvc"
    ];
    centerFormData.append("studyCenters_user_id", studyCenterUserId);

    fields.forEach(field => {
      centerFormData.append(field, state[field]);
    });
    return centerFormData
};