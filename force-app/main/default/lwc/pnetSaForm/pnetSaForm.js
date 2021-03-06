import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import submitSinglePnetSar from '@salesforce/apex/PharmanetPayloadController.submitSinglePnetSar';
export default class PnetSaForm extends LightningElement {
    @api
    caseId;
    
    _record;

    @api
    formDisabled;

    hasError;

    get msOptions () {
        return [{'value':'B','label':'Non-Benefit'},
                {'value':'L','label':'LCA',},
                {'value':'R','label':'RDP'}];
    }

    handleComboItemSelected (event) {
        this._record['specAuthType'] = event.target.value;
    }

    get record() {
        return {
            saRecord: {
                phn: this._record.phn,
                specAuthType: this._record.specAuthType,
                justificationCodes: this.strToArr(this._record.justificationCodes),
                excludedPlans: this.strToArr(this._record.excludedPlans),
                effectiveDate: this.dateSfdcToOdr(this._record.effectiveDate),
                terminationDate: this.dateSfdcToOdr(this._record.terminationDate),
                maxDaysSupply: this._record.maxDaysSupply,
                maxPricePct: this._record.maxPricePct,
                saRequester: {
                    practIdRef: this._record.practIdRef,
                    practId: this._record.practId
                },
                specialItem: {
                    din: this._record.din,
                    rdp: this._record.rdp
                }
            }
        };
    }

    @api
    set record(value) {
        this._record = {
            phn: value.saRecord.phn,
            practId: value.saRecord.saRequester.practId,
            practIdRef: value.saRecord.saRequester.practIdRef,
            din: value.saRecord.specialItem.din,
            rdpFormatted: this.formatRdp(value.saRecord.specialItem.rdp),
            rdp: value.saRecord.specialItem.rdp,
            specAuthType: value.saRecord.specAuthType,
            justificationCodes: this.arrToStr(value.saRecord.justificationCodes),
            excludedPlans: this.arrToStr(value.saRecord.excludedPlans),
            effectiveDate: this.dateOdrToSfdc(value.saRecord.effectiveDate),
            terminationDate: this.dateOdrToSfdc(value.saRecord.terminationDate),
            maxDaysSupply: value.saRecord.maxDaysSupply,
            maxPricePct: value.saRecord.maxPricePct,
        };
    }

    get isDin() {
        return this._record.din && this._record.din.length > 0;
    }

    get isRdp() {
        return this._record.rdp && this._record.rdp.length > 0
    }

    dateOdrToSfdc(odrDateStr) {
        if (!odrDateStr) return null;
        return odrDateStr.replaceAll('/', '-');
    }

    dateSfdcToOdr(sfdcDateStr) {
        if (!sfdcDateStr) return null;
        return sfdcDateStr.replaceAll('-', '/');
    }

    formatRdp(rdp) {
        if (!rdp) return null;
        return rdp.substring(0,4)+'-'+rdp.substring(4);
    }

    arrToStr(arr) {
        return arr ? arr.join(',') : '';
    }

    strToArr(strValue) {
        return strValue.split(',').map(item => item.trim());
    }

    handleFormChange(event) {
        this._record[event.currentTarget.dataset.field] = event.target.value;
    }

    @api
    async submit() {
        let subject = this._record.rdp || this._record.din;
        let success = true;
        
        this.formDisabled = true;
        
        try {
            await submitSinglePnetSar({caseId: this.caseId, pnetSa: this.record });
            this.showSuccess(`[${subject}] Submitted to Pharmanet.`);
        } catch (error) {
            this.showError(error.body.message);
            this.formDisabled = false;
            success = false;
        }

        return success;
    }

    showSuccess(message) {
        this.hasError = false;
        this.template.querySelector('.slds-box').classList.remove('submit-error');
        this.template.querySelector('.slds-box').classList.add('submit-success');
        this.showToast('Success', message, 'success');
    }
    
    showError(message) {
        console.log(message);
        this.hasError = true;
        this.template.querySelector('.slds-box').classList.add('submit-error');
        this.template.querySelector('.slds-box').classList.remove('submit-success');
        this.showToast('Error', message, 'error');
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            mode: "sticky",
            variant: variant
        }));
    }
}
