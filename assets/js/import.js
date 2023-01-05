/*=========================================================
　　　　　スライド操作関連
=======================================================*/
/* スライドオープン
====================================================*/
const slideDown = (target) => {
  target.style.height = 'auto';
  let h = target.offsetHeight;
  target.style.height = h + 'px';
  target.animate(
    {
      height: [0, h + 'px'],
    },
    {
      duration: 400,
      easing: 'ease',
    }
  );
};

/* スライドクローズ
====================================================*/
const slideUp = (target) => {
  let h = target.offsetHeight;
  target.style.height = h + 'px';
  target.animate(
    {
      height: [h + 'px', 0],
    },
    {
      duration: 400,
      easing: 'ease',
    }
  );
  target.style.height = 0;
};
