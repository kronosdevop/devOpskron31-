import { API, graphqlOperation } from "aws-amplify";

export const getData = {
    data: () => ({
        queryResponse: {},
    }),
    methods: {
        async fetchData(query, variables) {
            try {
                let result = await API.graphql(graphqlOperation(query, variables));
                this.queryResponse = {};
                let response = result;
                this.queryResponse = response;
            } catch (error) {
                this.queryResponse = {};
                throw error;
            }
        },
    }
};
