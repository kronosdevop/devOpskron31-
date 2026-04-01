import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_all_forms
} from "@/graphql/queries.js";

export const get_org_forms = {
    data: () => ({
        listForms: [],
       
    }),
    methods: {
        async get_org_forms() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                    graphqlOperation(list_all_forms, {
                      organization_id: data.organization.organization_id,
                      form_status: "ACTIVE",
                      form_type: "SYSTEM_FLOWS",
                      limit: 500,
                      next_token: null,
                    })
                  );
                this.listForms =[];
                var response = JSON.parse(result.data.list_all_forms);
                this.listForms = response.details;
                
              } catch (error) {
                this.listForms =[];
                 
              }
        },
    }
}