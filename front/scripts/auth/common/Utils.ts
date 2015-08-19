class Utils {

	public static loadUrl (url?: string): void {
		var win: Window;

		if (pageParams.isModal) {
			win = window.parent;
		} else {
			win = window;
		}

		if (url) {
			win.location.href = url;
			return
		}

		win.location.reload();
	}
}
