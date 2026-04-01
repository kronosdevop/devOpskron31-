import axios from "axios";

export const get_timezones_details = {
    data: () => ({
        timeZonesList: [],
    }),
    methods: {
        async get_timezones_details() {
        
            await   axios({
                method: "POST",
                url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/timezone_list",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": "EgnUv9Owyt8KacFkfnB44as9uqCT8ZaF9FZ1cVU6",
                },
                data: {

                },
              })
                .then((res) => {
                 
                  if (res.data.Status == "SUCCESS") {
                    this.timeZonesList = res.data.data;
                  } else {
                 
                    this.timeZonesList = []
                    
                  }
                })  
                .catch((err) => {
                  console.log(err);
                  this.currentObject = []
                 
                });
        },
    }
}