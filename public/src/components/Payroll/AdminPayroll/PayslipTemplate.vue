<template>
  <div>
    <v-card flat >
      <v-card-title class="mt-n4">
        Payslip Template
        <v-spacer />
        <v-btn
          @click="validate_actions()"
          :loading="loading"
          small
          dark
          class="white--text text-capitalize cardCss"
          >Save</v-btn
        >
      </v-card-title>
      <v-card-text>
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <v-form ref="form1">
          <v-row class="mt-5">
            <v-autocomplete
              v-model="selectedItem"
              :items="dropdownItems"
              style="max-width: 350px"
              item-text="text"
              item-value="value"
              outlined
              dense
              class="ml-3 mt-n4"
              label="Placeholder for Body"
              :search-input.sync="search"
              @input="search = ''"
            />

            <v-btn
              @click="insertSelectedItem"
              class="white--text text-capitalize cardCss ml-8 mt-n3"
              dark
              small
              >Add</v-btn
            >
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12">
              <label>Body :</label>
              <div id="editor7"></div>
            </v-col> </v-row
        ></v-form>
      </v-card-text>
    </v-card>
  </div>
</template>
    
    <script>
import { update_payslip_headers } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_payslip_headers } from "@/graphql/queries.js";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      subject: "",
      search: "",
      tosender: [],
      ccsender: [],
      atLeasttwoRule: (value) => {
        // Email validation logic
        if (!Array.isArray(value) || value.length === 0) {
          return "required";
        }

        for (const email of value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return "Invalid email address";
          }
        }

        return true;
      },
      atLeastOneEmailRule: (value) => {
        // Email validation logic
        // if (!Array.isArray(value) || value.length === 0) {
        //   return "required";
        // }

        for (const email of value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return "Invalid email address";
          }
        }

        return true;
      },
      selectedItem: null,
      dropdownValues: [],
      searchsub: "",
      dropdownItems: [],
      rules: {
        required: (value) => !!value || "Required.",
      },
      loading: false,

      SnackBarComponent: {},
      emailCheck: false,
      mailObject: {},
      emailObject: {},
      Objectemail: {},
      emailTemplate: "",
      template_id: "",
      selectedValue: "",
      header_id: "",
    };
  },
  async mounted() {
    // Load ClassicEditor from CDN
    // const script = document.createElement('script');
    // await this.emaillist();

    await this.placedrop(),
      ClassicEditor.create(document.querySelector("#editor7"), {
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "fontfamily",
            "fontsize",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bold",
            "italic",
            "strikethrough",
            "subscript",
            "superscript",
            "code",
            "|",
            "link",
            "insertTable",
            "blockQuote",
            "codeBlock",
            "|",
            "alignment",
            "|",
            "bulletedList",
            "numberedList",
            "todoList",
            "outdent",
            "indent",
          ],
          shouldNotGroupWhenFull: false,
        },
      })
        .then((editor7) => {
          this.editor7 = editor7;

          // Set the initial content
          editor7.setData(this.emailTemplate);
        })
        .catch((error) => {
          console.error(error);
        });
  },
  created() {},
  methods: {
    remove(item) {
      this.tosender.splice(this.tosender.indexOf(item), 1);
    },
    removecc(item) {
      this.ccsender.splice(this.ccsender.indexOf(item), 1);
    },
    handleInput() {
      // Update the data property as the user types
      this.body = this.$refs.textarea.value;
    },
    textareaRows() {
      const lineHeight = 20; // Adjust this value based on your textarea's line height
      const textarea = this.$refs.textarea;
      if (!textarea) return this.minRows; // Return minimum rows if textarea is not available yet

      const textareaHeight = textarea.clientHeight;
      const calculatedRows = Math.min(
        Math.max(Math.floor(textareaHeight / lineHeight), this.minRows),
        this.maxRows
      );
      return calculatedRows;
    },
    insertValue() {
      const textarea = this.$refs.textarea;
      const cursorPosition = textarea.selectionStart;
      const valueToInsert = this.selectedValue;

      // Update the text content by inserting the value
      this.subject =
        this.subject.slice(0, cursorPosition) +
        valueToInsert +
        this.subject.slice(cursorPosition);

      // Set the cursor position after inserting the value
      textarea.setSelectionRange(
        cursorPosition + valueToInsert.length,
        cursorPosition + valueToInsert.length
      );

      // Focus the textarea (optional)
      textarea.focus();
    },
    insertSelectedItem() {
      if (this.selectedItem) {
        // Get the current selection in CKEditor
        const selection = this.editor7.model.document.selection;

        // Get the selected item
        const selectedItem = this.selectedItem;

        // Check if there is a selection
        if (selection.isCollapsed) {
          // If there is no selection, insert the item at the end
          this.editor7.model.change((writer) => {
            writer.insertText(
              selectedItem,
              this.editor7.model.document.selection.getFirstPosition()
            );
          });
        } else {
          // If there is a selection, insert the item at the selection position
          this.editor7.model.change((writer) => {
            writer.insertText(
              selectedItem,
              this.editor7.model.document.selection.getFirstPosition()
            );
          });
        }
      }
    },
    validate_actions() {
      if (this.editor7) {
        // Get the content from CKEditor
        const editorContent = this.editor7.getData();

        // Check if the content is not empty
        if (editorContent.trim() !== "") {
          // Content is not empty, perform save operation

          if (this.$refs.form1.validate()) {
            var newvalue = this.editor7.getData();
            newvalue = newvalue
              .replace(
                /<td>/g,
                "<td style='border: 1px solid black;  padding: 8px;'>"
              )
              .replace(
                /<th>/g,
                "<th style='border: 1px solid black;  padding: 8px;background-color:lightgrey'>"
              );

            // .replace(
            //   /<th/g,
            //   "<th style='border: 1px solid #555; padding: 8px; background-color:lightgrey'"
            // );
            const regexTh = /<th\s+colspan="(\d+)"/g;

            // Replace matched <th> elements with the desired new string, preserving the colspan value
            newvalue = newvalue.replace(regexTh, (match, p1) => {
              return `<th colspan="${p1}" style="border: 1px solid #555; padding: 8px; background-color: lightgrey; "`;
            });
            const regexrowTh = /<th\s+rowspan="(\d+)"/g;

            // Replace matched <th> elements with the desired new string, preserving the colspan value
            newvalue = newvalue.replace(regexrowTh, (match, p1) => {
              return `<th colspan="${p1}" style="border: 1px solid #555; padding: 8px; background-color: lightgrey; "`;
            });

            // Regex to match <td> elements with colspan
            const regexTd = /<td\s+colspan="(\d+)"/g;

            // Replace matched <td> elements with the desired new string, preserving the colspan value
            newvalue = newvalue.replace(regexTd, (match, p1) => {
              return `<td colspan="${p1}" style="border: 1px solid #555; padding: 8px;"`;
            });
            const regexrowtd = /<td\s+rowspan="(\d+)"/g;

            // Replace matched <td> elements with the desired new string, preserving the colspan value
            newvalue = newvalue.replace(regexrowtd, (match, p1) => {
              return `<td colspan="${p1}" style="border: 1px solid #555; padding: 8px;"`;
            });

            // Regex to match <td> elements with colspan and rowspan
            const regexTdColspanRowspan =
              /<td\s+colspan="(\d+)"\s+rowspan="(\d+)"/g;

            // Replace matched <td> elements with the desired new string, preserving the colspan and rowspan values
            newvalue = newvalue.replace(
              regexTdColspanRowspan,
              (match, p1, p2) => {
                return `<td colspan="${p1}" rowspan="${p2}" style="border: 1px solid #555; padding: 8px;"`;
              }
            );
            const regexThColspanRowspan =
              /<th\s+colspan="(\d+)"\s+rowspan="(\d+)"/g;

            // Replace matched <td> elements with the desired new string, preserving the colspan and rowspan values
            newvalue = newvalue.replace(
              regexThColspanRowspan,
              (match, p1, p2) => {
                return `<th colspan="${p1}" rowspan="${p2}" style="border: 1px solid #555; padding: 8px; background-color: lightgrey;"`;
              }
            );
            this.emailTemplate = newvalue;
            this.call_headersapi();
          }
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "A template cannot be empty, it must be updated",
            timeout: 5000,
            Top: true,
          };
        }
        // Your save logic goes here
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "A template cannot be empty, it must be updated",
          timeout: 5000,
          Top: true,
        };
        // Content is empty, show an error message or handle accordingly
        console.warn("Content is empty. Please add content before saving.");
      }
    },

    async call_headersapi() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(update_payslip_headers, {
            input: {
              header_id: this.header_id,
              payslip_template: this.emailTemplate,
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.update_payslip_headers);

        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.placedrop();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.placedrop();
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
        this.loading = false;
      }
    },

    async placedrop() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_payslip_headers, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "PAYSLIP",
            },
          })
        );

        var response = JSON.parse(result.data.get_payslip_headers);

        if (response.Status == "SUCCESS") {
          this.header_id = response.data[0].header_id;
          var dform = response.data[0].header_details;
          dform.forEach((element) => {
            this.dropdownItems.push({
              text: element.headers_name,
              value: element.headers_placeholder,
            });
          });
          this.emailTemplate = response.data[0].payslip_template;
        }
        //  else {
        //   this.SnackBarComponent = {
        //     SnackbarVmodel: true,
        //     SnackbarColor: "red",
        //     Top: true,
        //     SnackbarText: response.message,
        //   };
        // }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          Top: true,
          SnackbarText: error.errors[0].message,
        };
      }
    },
  },
};
</script>
    
    <style scoped>
.outlined-textarea {
  border: 1px solid #ccc;
  border-radius: 2px;
  padding: 8px;
  font-size: 14px;
  line-height: 1;
  outline: none;
}
</style>