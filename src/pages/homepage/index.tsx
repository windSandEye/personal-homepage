import React, { useState, useEffect } from 'react';
import styles from './index.less';

export default () => {
  //初始化属性
  const [options, setOptions] = useState({
    width: 400,     //canvas画布宽度
    height: 500,       //canvas画布高度
    radius: 200,       //球心半径
    particleCount: 1000,  //粒子总数数
    particleRadius: 1,    //粒子半径
    maxRotationAngle: Math.PI / 100, //最大旋转角度
  })

  //初始化球体
  //所谓的球体，无非是多个圆环，按照垂直于圆环的方向旋转即可产生球形视觉效果
  useEffect(() => {
    //设置canvas宽高
    const canvasContainer = document.getElementById("personal-canvas-container");
    const canvas: any = document.getElementById("personal-canvas");
    canvas.width = canvasContainer?.offsetWidth;
    canvas.height = canvasContainer?.offsetHeight;

    setOptions(Object.assign({}, options, { width: canvas.width, height: canvas.height }))
    const ctx = canvas.getContext('2d');

    const particleCount = options.particleCount;

    //生成粒子坐标
    let particleList = [];
    for (let i = 0; i < particleCount; i++) {
      // let point = setBallAxis();
      let point = setConeAxis();

      particleList.push(point);
    }

    drawFigure(ctx, particleList)

  }, [options.width])


  const drawFigure = (ctx: any, particleList: any[]) => {
    let width = options.width;
    let height = options.height;
    ctx.clearRect(0, 0, options.width, options.height)

    //画粒子
    for (let particle of particleList) {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = 'hsl(' + particle.hue + ', 100%, 70%';
      ctx.arc(width / 2 + particle.x, height / 2 + particle.y, options.particleRadius, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();
    }

    //旋转
    let rotateList: any[] = []
    for (let point of particleList) {
      let ponitX = rotateX(point);
      let pointY = rotateY(ponitX);
      let pointZ = rotateZ(pointY);
      pointZ.hue = pointZ.hue + options.maxRotationAngle * 60
      rotateList.push(pointZ);
    }

    requestAnimationFrame(() => drawFigure(ctx, rotateList))


  }

  //绕X轴旋转
  const rotateX = (axis: any) => {
    let angle = options.maxRotationAngle;
    return {
      x: axis.x,
      y: axis.y * Math.cos(angle) - axis.z * Math.sin(angle),
      z: axis.z * Math.cos(angle) + axis.y * Math.sin(angle),
      hue: axis.hue
    }
  }

  //绕Y轴旋转
  const rotateY = (axis: any) => {
    let angle = options.maxRotationAngle;
    return {
      x: axis.x * Math.cos(angle) + axis.z * Math.sin(angle),
      y: axis.y,
      z: axis.z * Math.cos(angle) - axis.x * Math.sin(angle),
      hue: axis.hue
    }
  }



  //绕Z轴旋转
  const rotateZ = (axis: any) => {
    let angle = options.maxRotationAngle;
    return {
      x: axis.x * Math.cos(angle) - axis.y * Math.sin(angle),
      y: axis.y * Math.cos(angle) + axis.x * Math.sin(angle),
      z: axis.z,
      hue: axis.hue
    }
  }


  //坐标计算
  const setBallAxis = () => {
    const raduis = options.radius;
    let theta = Math.random() * Math.PI * 2;
    let phi = Math.random() * Math.PI * 2;
    let ringR = raduis * Math.sin(theta);
    let x = ringR * Math.sin(phi);
    let y = raduis * Math.cos(theta);
    let z = ringR * Math.cos(phi);
    return {
      x: x,
      y: y,
      z: z,
      hue: Math.round(phi / Math.PI * 10)
    }
  }

  const setConeAxis = () => {
    const raduis = options.radius;
    let phi = Math.random() * Math.PI * 2;
    //设置圆锥夹角为30度
    let h = raduis * Math.random();
    
    let x = h * Math.tan(30 * Math.PI / 180) * Math.sin(phi);
    let y = h;
    let z = h * Math.tan(30 * Math.PI / 180) * Math.cos(phi);;
    return {
      x: x,
      y: y,
      z: z,
      hue: Math.round(phi / Math.PI * 10)
    }

  }


  return (
    <div className={styles.homeContainer} id="personal-canvas-container">
      <canvas id="personal-canvas" style={{ width: options.width, height: options.height }}></canvas>
    </div>
  );
}
