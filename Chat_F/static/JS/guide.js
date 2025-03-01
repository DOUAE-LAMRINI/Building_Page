document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            // Toggle active class for answer and plus icon
            answer.classList.toggle('active');
            question.querySelector('.plus-icon').classList.toggle('active');

            // Smooth height and opacity transition for answer
            if (answer.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
                answer.style.opacity = "1";
                answer.style.padding = "20px";
            } else {
                answer.style.maxHeight = "0";
                answer.style.opacity = "0";
                answer.style.padding = "0 20px";
            }

            // Close other FAQ items when one is opened
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherQuestion = otherItem.querySelector('.faq-question');
                    if (otherAnswer.classList.contains('active')) {
                        otherAnswer.classList.remove('active');
                        otherAnswer.style.maxHeight = "0";
                        otherAnswer.style.opacity = "0";
                        otherAnswer.style.padding = "0 20px";
                        otherQuestion.querySelector('.plus-icon').classList.remove('active');
                    }
                }
            });
        });
    });
});