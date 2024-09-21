const menus = document.querySelectorAll('.menuOpen');
const closeMenus = document.querySelectorAll('.menuClose');
const dashboards = document.querySelectorAll('.dashContainer');

menus.forEach(menu => {
  menu.addEventListener('click', () => {
    menu.classList.add('hidden');

    closeMenus.forEach(closeMenu => {
      closeMenu.classList.remove('hidden');
    })

    dashboards.forEach(dashboard => {
      dashboard.classList.toggle('active');
    });
  });
});

closeMenus.forEach(closeMenu => {
  closeMenu.addEventListener('click', () => {
    closeMenu.classList.add('hidden');

    menus.forEach(menu => {
      menu.classList.remove('hidden');
    })

    dashboards.forEach(dashboard => {
      dashboard.classList.toggle('active');
    });
  })
})
