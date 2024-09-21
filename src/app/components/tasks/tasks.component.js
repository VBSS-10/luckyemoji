import './tasks.styles.scss';
import '../footer/footer.styles.scss';


export class Tasks {

    constructor() {
        this.initUI();
    }

    initUI() {
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new Tasks();
});
