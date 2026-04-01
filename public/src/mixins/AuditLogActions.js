import axios from "axios";
/* eslint-disable */
export const update_audit_logs = {
    data: () => ({
        auditLogs: {},
    }),
    methods: {
        async update_audit_logs() {
        
            await   axios({
                method: "POST",
                url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/aduit_logs_portal",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": "EgnUv9Owyt8KacFkfnB44as9uqCT8ZaF9FZ1cVU6",
                },
                data: {
                    user_email_id:this.$store.getters.GetUserEmail,
                    audit_type:this.$store.getters.GetAuditActions.AuditType,
                    audit_action:this.$store.getters.GetAuditActions.AuditAction,
                    audit_message:this.$store.getters.GetAuditActions.AuditMessage,
                    init_from:1
                },
              })
                .then((res) => {
                  
                //   if (res.data.Status == "SUCCESS") {
                //     this.currentObject = res.data.details;
                //   } else {
                 
                //     this.currentObject = {}
                    
                //   }
                })  
                .catch((err) => {
                    console.log(err)
                //   console.log(err);
                //   this.currentObject = {}
                 
                });
        },
    }
}