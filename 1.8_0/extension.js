(function () {
//Blazescorch2 notes: 1.8_3
// 1.8_1* 90ms clipped off end of some songs for better transitions.
// 1.8_2* Added New Leaf + New Leaf-Snowing music.
// 1.8_3* Added some K.K. Slider music and autoplay at 10pm Saturday.
// 1.8_4* Fixed error with new Chrome update that broke the extension. (6-4-2014)
//
//
	var audio, currentTime, currentMusic, slider, notification, badgeText = ('',''),						// Variables
		checkVolume, setAudioUrl, switchMusic, formatText, updateText, updateTime, init;	// Functions

	audio = document.createElement('audio');
	audio.loop = true;
	var day = new Date().getDay();
	var time = new Date().getHours();
	currentTime = new Date().getHours();
	currentMusic = localStorage['music'] ? localStorage['music'] : 'animal-forrest';

	checkVolume = function () {
		if (localStorage['volume']) {
			audio.volume = localStorage['volume'];
		}
	};

	setAudioUrl = function (file, day) {
		var time = new Date().getHours();
		//If today is Saturday at 10pm, play songs from the kk folder (if enabled).
		if (day === 6 & time === 22 & (localStorage['slider'] !== 'false')) {
			currentMusic = 'kk';
		}
		else {
			currentMusic = localStorage['music'] ? localStorage['music'] : 'animal-forrest';
		}
		audio.src = '../' + currentMusic + '/' + file + '.ogg';
	};

	switchMusic = function (time, day) {
		var day = new Date().getDay();
		var time = new Date().getHours();
		//If Saturday 
		if (day === 6 & time === 22 & (localStorage['slider'] !== 'false')) {
			notification = webkitNotifications.createNotification('clock.gif', 'Animal Crossing Music', 'It is now time to rock to some K.K Slider!!!');
		}
		else {
//Old notification method before 1.8_4 update
		//notification = webkitNotifications.createNotification('clock.gif', 'Animal Crossing Music', 'It is now ' + formatText(time,day) + '!');

// New 1.8_4 notification method.
			var opt = {
        			type: "basic",
        			title: "Animal Crossing Music",
        			message: 'It is now ' + formatText(time,day) + '!',
       				iconUrl: "clock.gif"
      			}
			chrome.notifications.create("", opt, function(id) {
   				console.error(chrome.runtime.lastError);
			localStorage['notifications'] = 'false';
			});
		}


		if (localStorage['notifications'] !== 'false') {
			notification.show();
		}
//Obsolete timeout for notification method before 1.8_4 update
		//window.setTimeout(function () {
			//notification.cancel()
		//}, 4500);
		updateText(time,day);
		if (day === 6 & time === 22 & (localStorage['slider'] !== 'false')) {
			//if the day is Saturday, a random K.K. Slider song is chosen to play (if enabled).
			setAudioUrl((Math.floor((Math.random() * 36) + 1).toString()), day);
		}
		else
			setAudioUrl(formatText(time, day));
	};

	//Determines the overlay text on the Extension Icon.
	formatText = function (time,day) {
		if (day === 6 & time === 22 & (localStorage['slider'] !== 'false')) {
			//if today is Saturday at 10pm, show the user they are listening to KK music (if enabled).
			return 'KK';
		}
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

	//Updates the Extension Icon's overlay text.
	updateText = function (time,day) {
		badgeText = formatText(time,day);
		chrome.browserAction.setBadgeText({ text: badgeText.replace('m', '') });
	};

	updateTime = function () {
		var time = new Date().getHours();

		// New hour! New music and new text.
		if ((time !== currentTime || currentMusic !== localStorage['music']) && !audio.paused) {
				currentMusic = localStorage['music'];
				switchMusic(time,day);
				audio.play();
				updateText(time,day);
				currentTime = time;
		}
	};

	// Set the globe spinning.
	init = function () {
		var day = new Date().getDay();
		checkVolume();
		switchMusic(currentTime);
		updateText(currentTime,day);
		updateTime();
		//K.K songs are long, so a different update timer must be used to avoid mid-song interruption from Math.random generation.
		if (day === 6 & time === 22 & (localStorage['slider'] !== 'false')) {
			setInterval(updateTime, 120000);
		}
		else
			setInterval(updateTime, 60000);
		chrome.browserAction.setBadgeBackgroundColor({ color: [57, 230, 0, 255] });
	};

	chrome.browserAction.onClicked.addListener(function () {
		checkVolume();
		if (audio.paused) {
			audio.play();
			updateTime();
			updateText(currentTime,day);
		}
		else {
			audio.pause();
			updateText(-1,day);
			notification.cancel();
		}
	});

	init();
})();