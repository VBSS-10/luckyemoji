import { App } from './components/app/app.component';
import { Profile } from './components/profile/profile.component';
import { Tasks } from './components/tasks/tasks.component';
import { Info } from './components/info/info.component';

// Check if the main app elements are present before initializing App
if (document.querySelector(App.S_COINS)) {
    // eslint-disable-next-line no-new
    new App();
}

// For profile.html page
if (document.querySelector('.profile__base')) {
    new Profile();
}


// For tasks.html page
if (document.querySelector('.tasks__base')) {
    new Tasks();
}


// For info.html page
if (document.querySelector('.info__base')) {
    new Info();
}

