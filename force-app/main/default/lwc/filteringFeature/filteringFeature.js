import { LightningElement, wire, track } from "lwc";
import getAllAccounts from "@salesforce/apex/AccountController.getAllAccounts";

const filterOperator = [{ label: 'Contains', value: 'contains' }, { label: 'Equal To', value: 'equalTo' }, { label: 'Not Equal To', value: 'notEqualTo' }]

export default class FilteringFeature extends LightningElement {
    acounts = [];
    @track filteredAccounts = [];
    filteredByColumn = 'all'
    filteredByText = ''
    filteredByOperator = 'contains'
    timer;
    isRendered = false;

    columns = [
        { label: 'Name', fieldName: 'Name', value: 'Name' },
        { label: 'Account Number', fieldName: 'AccountNumber', value: 'AccountNumber' },
        { label: 'Billing State', fieldName: 'BillingState', value: 'BillingState' },
        { label: 'Type', fieldName: 'Type', value: 'Type' },
        { label: 'Rating', fieldName: 'Rating', value: 'Rating' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', value: 'Phone' },
    ];

    filteredByColumnOptions = [...this.columns, { label: 'All', value: 'all' }]
    filteredByOperatorOptions = [];

    //this wire adapter will fetch all account records.
    @wire(getAllAccounts)
    _getAllAccounts({ error, data }) {
        if (data) {
            this.acounts = data;
            this.filteredAccounts = data;
            this.applyFilter()
        } else if (error) {
            console.error('Error:', JSON.stringify(error));
        }
    }

    renderedCallback() {
        if (!this.isRendered) {
            this.updateFilteredByOperatorOptions();
        }
        this.isRendered = true;
    }

    // on change function for all three inputs
    filteredByChange(event) {
        var { name, value } = event.target;
        this[name] = value;
        if (name === 'filteredByColumn') {
            this.updateFilteredByOperatorOptions()
        }
        this.applyFilter();
    }

    updateFilteredByOperatorOptions() {
        if (this.filteredByColumn === 'all') {
            this.filteredByOperator = 'contains'
            this.filteredByOperatorOptions = filterOperator.filter(e => { return e.value === 'contains' })
        } else {
            this.filteredByOperatorOptions = filterOperator
        }
    }

    applyFilter() {
        clearTimeout(this.timer)
        if (this.filteredByText) {
            const _filteredByColumn = this.filteredByColumn === 'All' ? this.columns.reduce((old, cur) => { return [...old, cur['fieldName']] }, []) : [this.filteredByColumn];
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this.timer = setTimeout(() => {
                switch (this.filteredByOperator) {
                    case 'contains':
                        this.filteredAccounts = this.acounts.filter(obj => _filteredByColumn.some(key => (obj[key] + '').toLowerCase().includes(this.filteredByText.toLowerCase())))
                        break;
                    case 'equalTo':
                        this.filteredAccounts = this.acounts.filter(obj => _filteredByColumn.some(key => (obj[key] + '').toLowerCase() === this.filteredByText.toLowerCase()))
                        break;
                    case 'notEqualTo':
                        this.filteredAccounts = this.acounts.filter(obj => _filteredByColumn.some(key => (obj[key] + '').toLowerCase() != this.filteredByText.toLowerCase()))
                        break;
                    default:
                        break;
                }

            }, 500)
        }
        else {
            this.filteredAccounts = this.acounts;
        }
    }



}