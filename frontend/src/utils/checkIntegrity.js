
import axios from "axios";

export async function checkTextForBannedWords(text) {
    try {
        const API = process.env.REACT_APP_BACKEND_BASE_URL;

        const response = await axios.post(`${API}/api/check/text`, {text}, {validateStatus: status => status < 500});

        if (response.status === 200)
            return false;

        return true;

    } catch(err) {
        console.log(err);
        return false;
    }
}


export async function checkURLIfMalicious(url) {
    try {
      const API = process.env.REACT_APP_BACKEND_BASE_URL;

      const response = await axios.post(`${API}/api/check/url`, {url}, {validateStatus: status => status < 500});

      if (response.status === 200)
          return false;

      return true;

  } catch(err) {
      console.log(err);
      return false;
  }
}


