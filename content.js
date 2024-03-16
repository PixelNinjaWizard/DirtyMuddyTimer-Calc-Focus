// this will inject CSS for highlighting
const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
.highlighted {
    background-color: yellow;
    font-weight: bold;
}
`;
document.head.appendChild(style);

// Highlight keywords related to tasks on the webpage
document.addEventListener('DOMContentLoaded', () => {
    const keywords = ['task', 'deadline'];
    highlightKeywords(keywords);
});

function highlightKeywords(keywords) {
    keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        document.body.innerHTML = document.body.innerHTML.replace(regex, '<span class="highlighted">$1</span>');
    });
}
