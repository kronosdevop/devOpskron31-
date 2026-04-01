import {
    API,
    graphqlOperation
} from "aws-amplify";
import { 
    quotation_terms_conditions 
} from "@/graphql/mutations.js";


export const get_termsAndcondition_list = {
    data: () => ({
        termsAndconditionList: [],
    }),
    methods: {
        async get_termsAndcondition_list() {
            try {
                let result = await API.graphql(
                    graphqlOperation(quotation_terms_conditions, {
                        input: {
                            action_type: "LIST",
                        },
                    })
                );
        
                this.overlay = false;
                var response = JSON.parse(result.data.quotation_terms_conditions);
        
                if (response.Status === "SUCCESS") {
                    this.termsAndconditionList = response;
                    this.$store.commit("SetTermsandConditions", this.termsAndconditionList);
                } else {
                    this.$store.commit("SetTermsandConditions", {});
                  // this.SnackBarComponent = {
                  //   SnackbarVmodel: true,
                  //   SnackbarColor: "red",
                  //   SnackbarText: response.Message,
                  //   timeout: 5000,
                  //   Top: true,
                  // };
                }
            } catch (error) {
                this.overlay = false;
                console.error(error);
            }
        },
    }
}