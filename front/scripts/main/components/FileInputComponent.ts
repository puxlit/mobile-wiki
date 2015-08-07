App.FileInputComponent = Em.Component.extend(Em.Evented, {
	reset: false,

	resetObserver: Em.observer('reset', function() {
		if (this.get('reset')) {
			this.$().find('input').val(null);
			this.set('reset', false);
		}
	}),

	change(event: Event): void {
		var input: HTMLInputElement = <HTMLInputElement> event.target;

		if (!Em.isEmpty(input.files)) {
			this.sendAction('fileUpload', input.files);
		}
	},

	click(): void {
		this.sendAction('click');
	}
});
