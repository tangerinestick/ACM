(function () {
//90ms clipped off end of each song
	var audio, currentTime, currentMusic, notification, badgeText = '',						// Variables
		checkVolume, setAudioUrl, switchMusic, formatText, updateText, updateTime, init;	// Functions

	audio = document.createElement('audio');
	audio.loop = true;
	currentTime = new Date().getHours();
	currentMusic = localStorage['music'] ? localStorage['music'] : 'animal-forrest';

	checkVolume = function () {
		if (localStorage['volume']) {
			audio.volume = localStorage['volume'];
		}
	};

	setAudioUrl = function (file) {
		currentMusic = localStorage['music'] ? localStorage['music'] : 'animal-forrest';
		audio.src = '../' + currentMusic + '/' + file + '.ogg';
	};

	switchMusic = function (time) {
		notification = webkitNotifications.createNotification('clock.gif', 'Animal Crossing Music', 'It is now ' + formatText(time) + '!');
		if (localStorage['notifications'] !== 'false') {
			notification.show();
		}
		window.setTimeout(function () {
			notification.cancel()
		}, 4500);
		updateText(time);
		setAudioUrl(formatText(time));
	};

	formatText = function (time) {
		if (time === -1) {
			return '';
		}
		else if (time === 0) {
			return '12am';
		}
		else if (time === 12) {
			return '12pm';
		}
		else if (time < 13) {
			return time + 'am';
		}
		else {
			return time - 12 + 'pm';
		}
	};

	updateText = function (time) {
		badgeText = formatText(time);
		chrome.browserAction.setBadgeText({ text: badgeText.replace('m', '') });
	};

	updateTime = function () {
		var time = new Date().getHours();

		// New hour! New music and new text.
		if ((time !== currentTime || currentMusic !== localStorage['music']) && !audio.paused) {
			currentMusic = localStorage['music'];
			switchMusic(time);
			audio.play();
			updateText(time);
			currentTime = time;
		}
	};

	// Set the globe spinning.
	init = function () {
		checkVolume();
		switchMusic(currentTime);
		updateText(currentTime);
		updateTime();
		setInterval(updateTime, 60000);
		chrome.browserAction.setBadgeBackgroundColor({ color: [57, 230, 0, 255] });
	};

	chrome.browserAction.onClicked.addListener(function () {
		checkVolume();
		if (audio.paused) {
			audio.play();
			updateTime();
			updateText(currentTime);
		}
		else {
			audio.pause();
			updateText(-1);
			notification.cancel();
		}
	});

	init();
})();