import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_all_expense_group
} from "@/graphql/queries.js";

export const get_expense_groups_users = {
    data: () => ({
        listExpense: [],
       
    }),
    methods: {
        async get_expense_groups_users() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                    graphqlOperation(list_all_expense_group, {
                      organization_id: data.organization.organization_id,
                      nextToken: null,
                      limit: 100,
                      expense_group_status: "ACTIVE",
                    })
                  );
                this.listExpense =[];
                var response = result.data.list_all_expense_group;
                this.listExpense = response.details;
               
              } catch (error) {
                this.listExpense =[];
                //  console.log(error)
              }
        },
    }
}