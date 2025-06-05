// by default set current view as notification
let currentView = 'notification'; // 'tiles' or 'notification'

function loadNotificationWork() {
    fetch('./thumbnails_work_and_project.json?' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            const count = data.length;
            let html = `<div class="section-title">Recent Work & Projects (${count})</div>`;
            data.forEach((item) => {
                const randomHours = Math.floor(Math.random() * 24);
                const randomDays = Math.floor(Math.random() * 30) + 1;
                
                const imageElement = item.img ? 
                    `<img src="${item.img}" class="notification-image" alt="${item.title}">` :
                    `<div class="default-notification-image"><i class="fa fa-briefcase"></i></div>`;
                
                html += `
                    <a href="${item.link}" target="_blank" class="notification-item">
                        ${imageElement}
                        <div class="notification-content">
                            <span class="notification-title">${item.title}</span>
                            <div class="notification-desc">${item.description}</div>
                        </div>
                    </a>
                `;
            });
            
            document.getElementById('middle-column').innerHTML = html;
        });
}
loadNotificationWork();

