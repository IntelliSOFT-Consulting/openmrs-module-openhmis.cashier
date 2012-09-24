openhmis.Department = openhmis.GenericModel.extend({
	meta: {
		name: __("Department"),
		namePlural: __("Departments"),
		openmrsType: 'metadata'
	},
	
	schema: {
		uuid: { type: 'Text', readOnly: true },
		name: 'Text',
		description: 'Text',
		retired: 'Text',
		retireReason: { type: 'Text', readOnly: true }
	},
	
	toString: function() {
		return this.get('name');
	}
});