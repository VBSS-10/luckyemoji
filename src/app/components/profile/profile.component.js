import './profile.styles.scss';
import '../footer/footer.styles.scss';


export class Profile {

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
    new Profile();
});
