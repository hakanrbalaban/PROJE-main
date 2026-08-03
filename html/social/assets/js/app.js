document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  initMobileMenu();
  initLikeButton();
  initPostCreation();
  initShowMoreComments();
  initStorySlider();
  initThemeToggle();
  initConversationNavigation();
});

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const isLoggedIn = localStorage.getItem('social_user');

  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
  }
}

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const currentTheme = document.body.getAttribute('data-theme');
      if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        this.innerHTML = '<i class="bi bi-moon"></i>';
      } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        this.innerHTML = '<i class="bi bi-brightness-high"></i>';
      }
    });

    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      themeToggle.innerHTML = '<i class="bi bi-brightness-high"></i>';
    }
  }
}

function initMobileMenu() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('mobileOverlay');

  if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.add('active');
      overlay.classList.add('active');
    });

    overlay.addEventListener('click', function () {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }
}

function initLikeButton() {
  const likeButtons = document.querySelectorAll('.like-btn');
  likeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      this.classList.toggle('liked');
      const countEl = this.querySelector('.like-count');
      if (!countEl) return;

      let count = parseInt(countEl.textContent);
      if (this.classList.contains('liked')) {
        count += 1;
      } else {
        count -= 1;
      }
      countEl.textContent = count > 0 ? count + ' Beğeni' : '';
    });
  });
}

function initPostCreation() {
  const postInput = document.getElementById('postInput');
  const postButton = document.getElementById('postButton');
  const postsContainer = document.getElementById('postsContainer');

  if (postInput && postButton && postsContainer) {
    postButton.disabled = true;

    postInput.addEventListener('input', function () {
      const content = this.value.trim();
      postButton.disabled = content.length === 0;
    });

    postButton.addEventListener('click', function () {
      const content = postInput.value.trim();
      const selectedImage = postInput.dataset.image;

      if (content === '' && !selectedImage) {
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem('social_user') || '{"name":"Demo Kullanıcı","avatar":"../img/profile.jpg"}');

      const postElement = createPostElement({
        author: currentUser.name,
        authorAvatar: currentUser.avatar,
        time: 'Az önce',
        content: content,
        image: selectedImage
      });

      postsContainer.insertBefore(postElement, postsContainer.firstChild);
      postInput.value = '';
      postInput.dataset.image = '';
      postButton.disabled = true;
      updatePostPreview(null);

      showToast('Gönderi paylaşıldı!', 'success');
    });
  }
}

function createPostElement(data) {
  const postCard = document.createElement('div');
  postCard.className = 'post-card mb-3';
  postCard.innerHTML = `
    <div class="post-header">
      <img src="${data.authorAvatar}" alt="${data.author}" class="post-author-img">
      <div>
        <div class="post-author-name">${data.author}</div>
        <div class="post-time text-muted small">${data.time}</div>
      </div>
      <div class="post-menu">
        <i class="bi bi-three-dots-vertical"></i>
      </div>
    </div>
    ${data.content ? `<div class="post-body">${data.content}</div>` : ''}
    ${data.image ? `<img src="${data.image}" alt="post image" class="post-image">` : ''}
    <div class="post-actions">
      <button class="action-btn like-btn">
        <i class="bi bi-heart"></i>
        <span class="like-count"></span>
      </button>
      <button class="action-btn">
        <i class="bi bi-chat-left"></i>
        0 Yorum
      </button>
      <button class="action-btn">
        <i class="bi bi-share"></i>
        Paylaş
      </button>
    </div>
    <div class="comment-section">
      <div class="show-comments text-muted small">Tüm yorumları göster</div>
    </div>
    <div class="chat-input-area" style="box-shadow:none; padding:8px 16px;">
      <input type="text" class="form-control border-0 bg-light composer-input-small" placeholder="Yorum yap...">
    </div>
  `;

  const likeBtn = postCard.querySelector('.like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', function () {
      this.classList.toggle('liked');
      const countEl = this.querySelector('.like-count');
      if (!countEl) return;
      let count = parseInt(countEl.textContent) || 0;
      if (this.classList.contains('liked')) {
        count += 1;
      } else {
        count -= 1;
      }
      countEl.textContent = count > 0 ? count + ' Beğeni' : '';
    });
  }

  return postCard;
}

function updatePostPreview(imageUrl) {
  const preview = document.getElementById('postImagePreview');
  const removeBtn = document.getElementById('removeImageBtn');
  if (!preview) return;

  if (imageUrl) {
    preview.innerHTML = `<img src="${imageUrl}" alt="preview" style="max-width:100%; border-radius:8px;">`;
    preview.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'inline-block';
  } else {
    preview.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'none';
  }
}

function initShowMoreComments() {
  const showMoreButtons = document.querySelectorAll('.show-more_comments');
  showMoreButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const moreComments = this.nextElementSibling;
      if (moreComments) {
        moreComments.style.display = 'block';
        this.style.display = 'none';
      }
    });
  });
}

function initStorySlider() {
  const storyContainers = document.querySelectorAll('.stories');
  storyContainers.forEach(function (container) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('mousedown', function (e) {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', function () {
      isDown = false;
    });

    container.addEventListener('mouseup', function () {
      isDown = false;
    });

    container.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    });
  });
}

function showToast(message, type) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast align-items-center';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-auto m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  container.appendChild(toast);

  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();

  toast.addEventListener('hidden.bs.toast', function () {
    toast.remove();
  });
}

function initConversationNavigation() {
  const conversationItems = document.querySelectorAll('.conversation-item');
  conversationItems.forEach(function (item) {
    item.addEventListener('click', function () {
      conversationItems.forEach(function (i) {
        i.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('Lütfen tüm alanları doldurun!', 'error');
    return;
  }

  const user = {
    name: email.split('@')[0],
    email: email,
    avatar: 'https://i.pravatar.com/150/?u=' + email
  };

  localStorage.setItem('social_user', JSON.stringify(user));
  window.location.href = 'index.html';
}

function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  if (!name || !email || !password) {
    showToast('Lütfen tüm alanları doldurun!', 'error');
    return;
  }

  const user = {
    name: name,
    email: email,
    avatar: 'https://i.pravatar.com/150/?u=' + email
  };

  localStorage.setItem('social_user', JSON.stringify(user));
  showToast('Kayıt başarılı! Yönlendiriliyorsunuz...', 'success');
  setTimeout(function () {
    window.location.href = 'login.html';
  }, 1500);
}

function handleLogout() {
  localStorage.removeItem('social_user');
  window.location.href = 'login.html';
}

function handleImageSelect() {
  const imageUrl = document.getElementById('postImageInput').value;
  if (imageUrl.trim()) {
    document.getElementById('postInput').dataset.image = imageUrl.trim();
    updatePostPreview(imageUrl.trim());
  }
}

window.socialApp = {
  handleLogin: handleLogin,
  handleRegister: handleRegister,
  handleLogout: handleLogout,
  handleImageSelect: handleImageSelect,
  showToast: showToast
};
