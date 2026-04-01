import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_all_user_projects
} from "@/graphql/queries.js";

export const get_project_list = {
    data: () => ({
        ProjectList: [],

    }),
    methods: {
        async get_project_list() {
            try {
                let result = await API.graphql(
                    graphqlOperation(list_all_user_projects, {
                        input: {
                            project_progress: 'LIVE',
                        },
                    })
                );
                this.ProjectList = [];
                var response = JSON.parse(result.data.list_all_user_projects);
                if (response.Status == "SUCCESS") {
                    this.ProjectList = response.data;
                    // console.log("project", this.ProjectList)
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}