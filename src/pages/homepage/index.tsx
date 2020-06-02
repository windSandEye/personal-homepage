import React, { useState, useEffect } from 'react';
import styles from './index.less';

export default () => {
  //初始化属性
  const [options, setOptions] = useState({
    width: 400,               //canvas画布宽度
    height: 500,              //canvas画布高度
    radius: 200,              //球心半径
    particleCount: 1000,      //粒子总数数
    particleRadius: 1,        //粒子半径
    maxRotationAngle: Math.PI / 60, //旋转角度
    transfromCount: 300,         //旋转500次切换下一个图形,每次旋转角度为maxRotationAngle
    graphList: ["ball", "cone"],  //图形列表
  })

  //缓存ctx对象
  const [canvasCtx, setCanvasCtx] = useState()

  //初始化图形下标
  const [graphIndex, setGraphIndex] = useState(0)

  //初始化画布
  useEffect(() => {
    //设置canvas宽高
    const canvasContainer = document.getElementById("personal-canvas-container");
    const canvas: any = document.getElementById("personal-canvas");
    canvas.width = canvasContainer?.offsetWidth;
    canvas.height = canvasContainer?.offsetHeight;

    const ctx = canvas.getContext('2d');
    setOptions(Object.assign({}, options, { width: canvas.width, height: canvas.height }))
    setCanvasCtx(ctx)
    //初始化图形
    redrawGraph(graphIndex)

    canvas.addEventListener("click", () => {
      changeGraph();
    })

  }, [canvasCtx, options.width])


  //图形下标改变后重绘新的图形
  useEffect(() => {
    redrawGraph(graphIndex)
  }, [graphIndex])

  //图形切换
  const changeGraph = () => {
    setGraphIndex(lastIndex => {
      let nextGraphIndex = lastIndex + 1;
      if (nextGraphIndex == options.graphList.length) {
        nextGraphIndex = 0;
      }
      return nextGraphIndex;
    })
  }


  //重绘新图形
  const redrawGraph = (graphIndex: number) => {
    if (canvasCtx) {
      //初始化图形
      let particleList: any = getParticleList(graphIndex);
      drawFigure(canvasCtx, particleList, 0);
    }
  }



  //获取粒子数组
  const getParticleList = (graphIndex: number) => {
    let graphList = options.graphList;
    let particleCount = options.particleCount;
    //生成粒子坐标
    let particleList = [];
    for (let i = 0; i < particleCount; i++) {
      let point = setAxis(graphList[graphIndex]);
      particleList.push(point);
    }

    return particleList;
  }


  const drawFigure = (ctx: any, particleList: any[], transfromNum: number) => {
    let animationFrame = requestAnimationFrame(() => drawFigure(canvasCtx, rotateList, transfromNum))
    if (!ctx) {
      return;
    }
    let width = options.width;
    let height = options.height;
    let transfromCount = options.transfromCount;
    ctx.clearRect(0, 0, options.width, options.height);

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
    let rotateList: any = []
    let maxRotationAngle = options.maxRotationAngle;
    for (let point of particleList) {
      let ponitX = rotateX(point, maxRotationAngle);
      let pointY = rotateY(ponitX, maxRotationAngle);
      let pointZ = rotateZ(pointY, maxRotationAngle);
      pointZ.hue = pointZ.hue + maxRotationAngle * 60
      rotateList.push(pointZ);
    }

    let particleArr = rotateList;

    ++transfromNum;
    if (transfromNum % transfromCount == 0) {
      transfromNum = 0;
      cancelAnimationFrame(animationFrame)
      changeGraph();
    }
  }

  //绕X轴旋转
  const rotateX = (axis: any, angle: number) => {
    return {
      x: axis.x,
      y: axis.y * Math.cos(angle) - axis.z * Math.sin(angle),
      z: axis.z * Math.cos(angle) + axis.y * Math.sin(angle),
      hue: axis.hue
    }
  }

  //绕Y轴旋转
  const rotateY = (axis: any, angle: number) => {
    return {
      x: axis.x * Math.cos(angle) + axis.z * Math.sin(angle),
      y: axis.y,
      z: axis.z * Math.cos(angle) - axis.x * Math.sin(angle),
      hue: axis.hue
    }
  }



  //绕Z轴旋转
  const rotateZ = (axis: any, angle: number) => {
    return {
      x: axis.x * Math.cos(angle) - axis.y * Math.sin(angle),
      y: axis.y * Math.cos(angle) + axis.x * Math.sin(angle),
      z: axis.z,
      hue: axis.hue
    }
  }

  const setAxis = (graph: string) => {
    switch (graph) {
      case "ball":
        return setBallAxis();
      case "cone":
        return setConeAxis();
    }
  }


  //计算球体坐标，所有的粒子都分布在球体表面
  //所谓的球体，无非是多个圆环，按照垂直于圆环的方向旋转即可产生球形视觉效果
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

  //计算圆锥坐标
  const setConeAxis = () => {
    const raduis = options.radius;
    let phi = Math.random() * Math.PI * 2;
    //设置圆锥夹角为30度，底面积半径为R,l = 2R
    //圆锥面积为πr(l+r),所以底面积占圆锥1/3大小
    let bottomStatus = Math.random() > 1 / 3;
    let h = raduis * Math.cos(30 * Math.PI / 180);

    let x, y, z;
    if (!bottomStatus) {//底面积 
      let bottomR = raduis * Math.random();
      x = bottomR * Math.sin(phi);
      y = -1 * h;
      z = bottomR * Math.cos(phi);
    } else {
      y = h * (1 - Math.random() * 2);
      let coneH = h - y;
      let coneR = coneH * Math.tan(30 * Math.PI / 180);
      x = coneR * Math.sin(phi);
      z = coneR * Math.cos(phi);
    }

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
