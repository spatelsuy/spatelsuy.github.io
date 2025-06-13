        // by default set current view as notification
        let currentView = 'notification'; // 'tiles' or 'notification'

        //add required listner
        document.addEventListener('DOMContentLoaded', function() {
            // Set click handlers
            document.getElementById('blog-link').onclick = function() {
                document.getElementById('blog-link').classList.add('active');
                document.getElementById('work-link').classList.remove('active');
                // display depends on which view to show..
                if(currentView === 'tiles') {
                    loadMyBlogs();
                } else {
                    loadNotificationBlogs();
                }
            };
            
            document.getElementById('work-link').onclick = function() {
                document.getElementById('work-link').classList.add('active');
                document.getElementById('blog-link').classList.remove('active');
                if(currentView === 'tiles') {
                    loadMyWork();
                } else {
                    loadNotificationWork();
                }
            };
            
            document.getElementById('view-toggle').onclick = toggleView;

            // Load Notification View by default
            document.getElementById('content-area').style.display = 'none';
            document.getElementById('notification-view').style.display = 'block';
            loadAbountMeBeyondSocial();
            loadNotificationBlogs(); // This will load blog notifications first

        });

        
        function toggleView() {            
            if(currentView === 'tiles') {
                currentView = 'notification';
                document.getElementById('content-area').style.display = 'none';
                document.getElementById('notification-view').style.display = 'block';
                document.getElementById('view-toggle').innerHTML = '<i class="fa fa-th-large"></i>'; // Tiles icon
                
                // Load appropriate content based on active tab
                if(document.getElementById('blog-link').classList.contains('active')) {
                    loadNotificationBlogs();
                } else {
                    loadNotificationWork();
                }
            } else {
                currentView = 'tiles';
                document.getElementById('content-area').style.display = 'block';
                document.getElementById('notification-view').style.display = 'none';
                document.getElementById('view-toggle').innerHTML = '<i class="fa fa-th-list"></i>'; // List icon                
                // Load appropriate content based on active tab
                if(document.getElementById('blog-link').classList.contains('active')) {
                    loadMyBlogs();
                } else {
                    loadMyWork();
                }
            }
        }
        
        function loadAbountMeBeyondSocial() {
            // Left column content
            let myHTML = `
                <div class="section-title">About</div>
                <div id="about-me-content">
                        I’m a tech enthusiast with a strong interest in software development, 
                        IT operations, and cybersecurity - always exploring, learning, and staying adaptable in the fast-changing tech world.
                        This site, maintained by me and hosted on GitHub. It serves as a personal space where I publish blogs to share my thoughts, 
                        experiences, and learnings. In addition, the site showcases some of my personal applications and projects. 
                        My goal is to keep the content fresh and relevant, reflecting both my ongoing work and continuous learning.
                </div>
                <div class="section-title section-title30">Beyond the Keyboard</div>
                <div id="beyond-content">Loading...</div>
                <div class="section-title section-title30">Social and Other Platforms</div>
                <div id="my-social-content">Loading...</div>
            `;
            document.getElementById('middle-column-1').innerHTML = myHTML;
            
            // Load About Me and Beyond content
            loadBeyondForNotification();
            loadSocialInfo();
        }

        async function loadSocialInfo(){
            let socialHtml = `
                <div class="section-title15">
                    <i class="fa fa-linkedin-square contactIcon" aria-hidden="true"></i>
                    <a href="https://www.linkedin.com/in/spatelsuy/" target="_blank">in/spatelsuy</a>&nbsp;&nbsp;
                    
                    <i class="fa fa-github contactIcon" aria-hidden="true"></i>
                    <a href="https://github.com/spatelsuy/" target="_blank">Github/spatelsuy</a>&nbsp;&nbsp;
            
                    <i class="fa fa-youtube contactIcon" aria-hidden="true"></i>
                    <a href="https://www.youtube.com/@SecuNotes/" target="_blank">@SecuNotes</a>&nbsp;&nbsp;
            
                    <i class="fa fa-globe contactIcon" aria-hidden="true"></i>
                    <a href="https://www.udemy.com/user/sunil-patel-334/" target="_blank">Udemy</a>
                </div>
            `;
            document.getElementById('my-social-content').innerHTML = socialHtml;
        }
        async function loadAboutMeForNotification() {
            try {
                const response = await fetch('./AboutMe.html');
                const html = await response.text();
                document.getElementById('about-me-content').innerHTML = html;
            } catch (error) {
                document.getElementById('about-me-content').innerHTML = '<p>Error loading content.</p>';
                console.error('Error loading AboutMe.html:', error);
            }
        }
        
        async function loadBeyondForNotification() {
            try {
                const response = await fetch('./Beyond.html');
                const html = await response.text();
                document.getElementById('beyond-content').innerHTML = html;
            } catch (error) {
                document.getElementById('beyond-content').innerHTML = '<p>Error loading content.</p>';
                console.error('Error loading Beyond.html:', error);
            }
        }
        
        function loadNotificationBlogs() {
            fetch('./thumbnails_blogs.json?' + new Date().getTime())
                .then(response => response.json())
                .then(data => {
                    const count = data.length;
                    let html = `<div class="section-title">Recent Blog Posts (${count})</div>`;
                    
                    data.forEach((item) => {
                        const randomHours = Math.floor(Math.random() * 24);
                        const randomDays = Math.floor(Math.random() * 7);
                        
                        const imageElement = item.img ? 
                            `<img src="${item.img}" class="notification-image" alt="${item.title}">` :
                            `<div class="default-notification-image"><i class="fa fa-file-text"></i></div>`;
                        
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
        
        function loadMyBlogs(){
            fetch('./thumbnails_blogs.json?' + new Date().getTime())
                .then(response => response.json())
                .then(data => {
                    let html = '<p align="center"><i>Learning by Doing. Exploring Ideas. Writing to Reflect.</i><br>' + 
                        '<br>These blogs are inspired by lessons learned, hands-on experiences in live IT environments, and reflections on forward-thinking ideas.'+
                        '<br>Whether it&#39;s Cybersecurity, Identity & Access Management, delivery transformation, strategic outcomes, ' + 
                        'or leadership topics — these posts aim to inform, inspire, and spark meaningful conversations.</p><div class="thumbnails-container">';
                    data.forEach((item) => {
                        const hasImage = item.img;
                        
                        html += `
                            <div class="thumbnail">
                                <a href="${item.link}" target="_blank" class="thumbnail-link">
                                    <div class="thumbnail-inner">
                                        <div class="thumbnail-front">
                                            ${hasImage ? 
                                                `<img src="${item.img}" class="thumbnail-image" alt="${item.title}">` 
                                                : ''
                                            }
                                            <div class="title-bar">
                                                <div class="thumbnail-title">${item.title}</div>
                                            </div>
                                        </div>
                                        <div class="thumbnail-back">
                                            <div class="thumbnail-desc">${item.description}</div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `;
                    });
                    
                    html += '</div>';
                    document.getElementById('content-area').innerHTML = html;
                });   
        }
        
        function loadMyWork() {
            fetch('./thumbnails_work_and_project.json?' + new Date().getTime())
                .then(response => response.json())
                .then(data => {
                    let html = '<p align="center"><i>A collection of tools and projects driven by curiosity and creativity.</i><br><br>' +
                         'These are simple tools and utilities built to explore new ideas, solve problems, and share practical solutions with the community.<br>' +
                         'I share them through GitHub so others can use, learn from, or extend them further...</p><div class="thumbnails-container">';
                    
                    data.forEach((item) => {
                        const hasImage = item.img;
                        
                        html += `
                            <div class="thumbnail">
                                <a href="${item.link}" target="_blank" class="thumbnail-link">
                                    <div class="thumbnail-inner">
                                        <div class="thumbnail-front">
                                            ${hasImage ? 
                                                `<img src="${item.img}" class="thumbnail-image" alt="${item.title}">` 
                                                : ''
                                            }
                                            <div class="title-bar">
                                                <div class="thumbnail-title">${item.title}</div>
                                            </div>
                                        </div>
                                        <div class="thumbnail-back">
                                            <div class="thumbnail-desc">${item.description}</div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `;
                    });
                    
                    html += '</div>';
                    document.getElementById('content-area').innerHTML = html;
                });
        }
