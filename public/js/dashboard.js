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

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.pageLinks button');
  const containers = document.querySelectorAll('.dashMain .container');

  function switchContainer(target) {
    containers.forEach(container => {
      container.classList.add('hidden');
    });

    const activeContainer = document.querySelector(`.container.${target}`);
    if (activeContainer) {
      activeContainer.classList.remove('hidden'); 
    }
  }

  switchContainer('home');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      switchContainer(target);
    });
  });
});