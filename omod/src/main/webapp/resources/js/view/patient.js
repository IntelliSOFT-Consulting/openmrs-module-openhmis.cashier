define(
	[
		'lib/backbone',
		'lib/underscore',
		'model/patient'
	],
	function(Backbone, _, openhmis) {
		openhmis.PatientView = Backbone.View.extend({
			tmplFile: 'patient.html',
			tmplSelector: '#patient-details-template',
			
			initialize: function(options) {
				_.bindAll(this);
				this.template = this.getTemplate();
				this.readOnly = (options && options.readOnly) ? options.readOnly : false;
			},
			
			setElement: function(el) {
				Backbone.View.prototype.setElement.call(this, el);
				this.detailsEl = this.$('#patient-details');
				this.findEl = this.$('#find-patient');
			},
			
			events: {
				'click .editBillPatient': 'editPatient'
			},
			
			takeRawPatient: function(index, data) {
				data.identifiers = [{ display: data.identifier }];
				data.person = { display: data.personName };
				var model = new openhmis.Patient(data);
				this.selectPatient(model);
			},
			
			selectPatient: function(patient) {
				patient = patient ? patient : this.model;
				this.model = patient;
				this.render();
				this.trigger('selected', this.model);
			},
			
			editPatient: function() {
				this.detailsEl.hide();
				this.findEl.show();
				this.$('#inputNode').focus();
				this.trigger('editing');
			},
				
			render: function() {
				if (this.$findPatient === undefined)
					this.$findPatient = this.$('#findPatients');
				if (this.$findPatient.find('.cancel').length === 0 && this.model) {
					var cancelBtn = $('<input type="button" class="cancel" value="Cancel" />');
					this.$findPatient.append(cancelBtn);
					var self = this;
					cancelBtn.click(function() { self.selectPatient(); });
				}
				if (this.model === undefined) {
					this.findEl.show();
					this.detailsEl.hide();
				}
				else {
					this.findEl.hide();
					this.detailsEl.html(this.template({ patient: this.model, readOnly: this.readOnly }));
					this.detailsEl.show();
				}
				return this;
			}
		});
		
		return openhmis;
	}
);
