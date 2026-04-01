import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    create_list_delete_tags
} from "@/graphql/mutations.js";

export const get_asset_tags = {
    data: () => ({
        masterAsseTags: [],
        
    }),
    methods: {
        async get_asset_tags() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                  graphqlOperation(create_list_delete_tags, {
                    input: {
                        user_email_id: data.user.user_email_id,
                        action_type: 'LIST_TAGS',
                      },
                  })
                );
                this.masterAsseTags =[];
                var response = JSON.parse(result.data.create_list_delete_tags);
                if (response.Status == "SUCCESS") {
                  response.data.forEach(element => {
                    if(element.tag_status == "ACTIVE" && element.sub_tag.length != 0 ){
                      this.masterAsseTags.push(element) ;
                    }
                  });
               

                this.masterAsseTags.sort((a, b) => {
                  return a.tag_prefix.localeCompare(b.tag_prefix);
                });
                }else{
                  this.masterAsseTags =[];
                }
              } catch (error) {
                 this.masterAsseTags =[];
                //  console.log(error)
              }
        },
    }
}