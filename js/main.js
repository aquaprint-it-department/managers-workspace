import {header} from './templates/header.js';
import {sidebar} from './templates/sidebar.js';

// Додаємо хедер на сторінку
document.getElementById('header').innerHTML = header;
document.getElementById('sidebar').innerHTML = sidebar;