import './info.styles.scss';
import '../footer/footer.styles.scss';


export class Info {

    constructor() {
        this.initUI();
    }

    initUI() {
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html'; // Путь на страницу со слот машиной
            });
        }


    }

}

document.addEventListener('DOMContentLoaded', () => {
    new Info();
});
