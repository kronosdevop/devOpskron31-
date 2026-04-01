import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_users
} from "@/graphql/queries.js";

export const get_all_users = {
    data: () => ({
        listUsers: [],
       
    }),
    methods: {
        async get_all_users() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                  graphqlOperation(list_users, {
                    organization_id: data.organization.organization_id,
                    user_status: 'ACTIVE',
                    user_type: "MEMBER",
                    limit: 500,
                    next_token: null,
                    name_search:"",
                  })
                );
                this.listUsers =[];
                var response = result.data.list_users;
                
                this.listUsers =response.details;
               
              } catch (error) {
                //  console.log(error)
              }
        },
    }
}