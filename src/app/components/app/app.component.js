import { SYMBOLS_RANDOM } from '../../constants/symbols.constants';
import { IS_DESKTOP } from '../../constants/browser.constants';
import { SlotMachine } from '../slot-machine/slot-machine.component';
import { ToggleButton } from '../toggle-button/toggle-button.component';
import { Modal } from '../modal/modal.component';
import { PayTable } from '../pay-table/pay-table.component';
import { SMSoundService } from '../../services/slot-machine/sound/slot-machine-sound.service';
import { SMVibrationService } from '../../services/slot-machine/vibration/slot-machine-vibration.service';

import './app.style.scss';
import '../header/header.styles.scss';
import '../footer/footer.styles.scss';
import '../modal/modal.styles.scss';
import '../pay-table/pay-table.styles.scss';
import '../instructions/instructions.styles.scss';

const SERVICES = {
    sound: SMSoundService,
    vibration: SMVibrationService,
};

const handleOptionChange = (key, value) => {
    const service = SERVICES[key];

    if (service) service[value ? 'enable' : 'disable']();

    localStorage.setItem(key, value);

    // Сохранение состояния в базу данных через API
    saveUserData({ [key]: value });
};

async function saveUserData(data) {
    try {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) {
            console.error('Telegram WebApp data is not available');
            return;
        }

        const response = await fetch('https://c8b5-78-153-139-203.ngrok-free.app/api/save_user_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                ...data,
            }),
        });

        if (!response.ok) {
            console.error('Failed to save user data');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export class App {

    static C_FOCUS_ACTIVE = 'focus-active';

    static S_COINS = '#coins';
    static S_JACKPOT = '#jackpot';
    static S_SPINS = '#spins';
    static S_MAIN = '#main';
    static S_TOGGLE_SOUND = '#toggleSound';
    static S_TOGGLE_VIBRATION = '#toggleVibration';
    static S_VIBRATION_INSTRUCTIONS = '#vibrationInstructions';
    static S_INSTRUCTIONS_MODAL = '#instructionsModal';
    static S_INSTRUCTIONS_MODAL_BUTTON = '#toggleInstructions';
    static S_PAY_TABLE_MODAL = '#payTableModal';
    static S_PAY_TABLE_MODAL_BUTTON = '#togglePayTable';
    static S_PLAY = '#playButton';

    static ONE_DAY = 1000 * 60 * 60 * 24;

    constructor() {
        this.coinsElement = null;
        this.jackpotElement = null;
        this.spinsElement = null;
        this.mainElement = null;

        this.slotMachine = null;
        this.payTable = null;
        this.instructionsModal = null;

        this.coins = parseInt(localStorage.coins, 10) || 100;
        this.jackpot = parseInt(localStorage.jackpot, 10) || 1000;
        this.spins = parseInt(localStorage.spins, 10) || 0;
        this.lastSpin = localStorage.lastSpin || 0;
        this.isSoundDisabled = localStorage.sound === 'false';
        this.isVibrationDisabled = localStorage.vibration === 'false';
        this.isFirstTime = localStorage.firstTime !== 'false';

        const now = Date.now();

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
        }

        if (now - this.lastSpin >= App.ONE_DAY) {
            localStorage.jackpot = this.jackpot = Math.max(500, this.jackpot - 500 + (Math.random() * 1000)) | 0;
            localStorage.lastSpin = now;
        }

        this.handleModalToggle = this.handleModalToggle.bind(this);
        this.handleUseCoin = this.handleUseCoin.bind(this);
        this.handleGetPrice = this.handleGetPrice.bind(this);

        this.initUI();
    }

    initUI() {
        this.coinsElement = document.querySelector(App.S_COINS);
        this.jackpotElement = document.querySelector(App.S_JACKPOT);
        this.spinsElement = document.querySelector(App.S_SPINS);
        this.mainElement = document.querySelector(App.S_MAIN);

        this.refreshGameInfo();

        if (IS_DESKTOP) {
            document.querySelector(App.S_TOGGLE_VIBRATION)?.parentElement.setAttribute('hidden', true);
            document.querySelector(App.S_VIBRATION_INSTRUCTIONS)?.setAttribute('hidden', true);
        }

        this.initToggleButtons();

        const playButtonElement = document.querySelector(App.S_PLAY);

        if (this.isFirstTime && playButtonElement) {
            playButtonElement.onclick = () => {
                this.isFirstTime = localStorage.firstTime = false;

                playButtonElement.setAttribute('hidden', true);

                this.instructionsModal.close();

                document.activeElement.blur();

                this.slotMachine.start();
            };
        } else if (playButtonElement) {
            playButtonElement.setAttribute('hidden', true);
        }

        this.instructionsModal = new Modal(
            App.S_INSTRUCTIONS_MODAL,
            App.S_INSTRUCTIONS_MODAL_BUTTON,
            'instructions',
            this.isFirstTime,
            this.isFirstTime,
            this.handleModalToggle,
        );

        this.slotMachine = new SlotMachine(
            this.mainElement,
            this.handleUseCoin,
            this.handleGetPrice,
            5,
            SYMBOLS_RANDOM,
            this.isFirstTime,
        );

        this.payTable = new PayTable(SYMBOLS_RANDOM);

        new Modal(
            App.S_PAY_TABLE_MODAL,
            App.S_PAY_TABLE_MODAL_BUTTON,
            'pay-table',
            false,
            false,
            this.handleModalToggle,
        );
    }

    refreshGameInfo() {
        const maxValue = Math.max(this.coins, this.jackpot, this.spins);
        const padding = Math.max(Math.ceil(maxValue.toString().length / 2) * 2, 5);

        if (this.coinsElement) {
            this.coinsElement.innerText = `${ this.coins }`.padStart(padding, '0');
        }
        if (this.jackpotElement) {
            this.jackpotElement.innerText = `${ this.jackpot }`.padStart(padding, '0');
        }
        if (this.spinsElement) {
            this.spinsElement.innerText = `${ this.spins }`.padStart(padding, '0');
        }
    }

    initToggleButtons() {
        new ToggleButton(App.S_TOGGLE_SOUND, 'sound', !this.isSoundDisabled, handleOptionChange);

        if (!IS_DESKTOP) {
            new ToggleButton(App.S_TOGGLE_VIBRATION, 'vibration', !this.isVibrationDisabled, handleOptionChange);
        }
    }

    handleUseCoin() {
        localStorage.coins = this.coins = Math.max(this.coins - 1, 0) || 100;
        localStorage.jackpot = ++this.jackpot;
        localStorage.spins = ++this.spins;
        localStorage.lastSpin = this.lastSpin = Date.now();

        this.refreshGameInfo();
        saveUserData({
            coins: this.coins,
            jackpot: this.jackpot,
            spins: this.spins,
            lastSpin: this.lastSpin,
        });
    }

    handleGetPrice(jackpotPercentage) {
        const price = Math.min(Math.max(Math.ceil(jackpotPercentage * this.jackpot), 10), this.jackpot);

        localStorage.jackpot = this.jackpot = Math.max(this.jackpot - price, 0) || 1000;
        localStorage.coins = this.coins += price;

        this.refreshGameInfo();
        saveUserData({
            coins: this.coins,
            jackpot: this.jackpot,
        });
    }

    handleModalToggle(isOpen, key) {
        if (!this.slotMachine || key.includes('-init')) return;

        if (isOpen) {
            this.slotMachine.pause();
        } else {
            this.slotMachine.resume();
        }
    }

}
