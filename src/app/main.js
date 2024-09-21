import { App } from './components/app/app.component';
import { Wallet } from './components/wallet/wallet.component';
import { Tasks } from './components/tasks/tasks.component';
import { Info } from './components/info/info.component';

// Check if the main app elements are present before initializing App
if (document.querySelector(App.S_COINS)) {
    // eslint-disable-next-line no-new
    new App();
}

// For wallet.html page
if (document.querySelector('.wallet__base')) {
    new Wallet();
}


// For tasks.html page
if (document.querySelector('.tasks__base')) {
    new Tasks();
}


// For info.html page
if (document.querySelector('.info__base')) {
    new Info();
}

