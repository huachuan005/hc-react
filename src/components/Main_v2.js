require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import ReactDOM from 'react-dom';

let yeomanImage = require('../images/yeoman.png'); // 路径直接可以转化为地址

// 获取图片相关的数据
let imageDatas = require('../data/imageDatas.json');

// // 利用自执行函数，将图片的信息转化图片的路径信息
imageDatas = (function genImageUrl(imageDataArr) {
    for (var i = 0; i < imageDataArr.length; i++) {
        var singleImageData = imageDataArr[i]; // 单个的图片数据

        // 处理单个数据是添加一条键值imageUrl
        singleImageData.imageUrl = require('../images/' + singleImageData.fileName);

        // 赋值回来
        imageDataArr[i] = singleImageData;

    }
    return imageDataArr;

})(imageDatas);

//获取区间内的一个随机值
let getRangeRandom = (low, high) => Math.floor(Math.random() * (high - low) + low);

//获取0-30°之间一个任意正负值
let get30DegRandom = () => {
    let deg = '';
    deg = (Math.random() > 0.5) ? '+' : '-';
    return deg + Math.ceil(Math.random() * 30);
};

// 把图片名，转化为图片路径
// imageDatas = genImageUrl(imageDatas);
console.log(imageDatas);

class ImgFigure extends React.Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    /*
     *imgsFigue的点击处理函数
     */
    handleClick(e) {
        //翻转和居中图片
        // this.props.inverse();

        if (this.props.arrange.isCenter) {
            this.props.inverse();
        } else {
            this.props.center();
        }
        e.stopPropagation();
        e.preventDefault();
    }

    render() {

        let styleObj = {};
        //如果props属性中指定了这张图片的位置,则使用
        if (this.props.arrange.pos) {
            styleObj = this.props.arrange.pos;
        }

        //如果图片的旋转角度有值并且不为0，添加旋转角度
        if (this.props.arrange.rotate) {
            (['MozTransform', 'msTransform', 'WebkitTransform', 'transform']).forEach((value) => {
                styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
            });
        }

        if (this.props.arrange.isCenter) {
            styleObj.zIndex = 121
        }

        let imgFigureClassName = 'img_figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is_inverse ' : '';

        return (
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
            <img src = {this.props.data.imageUrl} alt = {this.props.data.title}/>
            <figcaption>
            <h2 className="img_title">{this.props.data.title}</h2>
            <div className="img_back" onClick={this.handleClick}>
                <p>{this.props.data.desc}</p>
            </div>
            </figcaption>  
            </figure>
        );
    }
}

// 控制组件
class ControllerUnit extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    /*
     *imgsFigue的点击处理函数
     */
    handleClick(e) {
        //翻转和居中图片
        if (this.props.arrange.isCenter) {
            this.props.inverse()
        } else {
            this.props.center();
        }
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        let controllerUnitClassName = 'controller_unit';
        //如果对应的是居中的图片，显示控制按钮的居中态
        if (this.props.arrange.isCenter) {
            controllerUnitClassName += ' is_center ';
            //如果翻转显示翻转状态
            if (this.props.arrange.isInverse) {
                controllerUnitClassName += 'is_inverse'
            }
        }
        return (
            <span className={ controllerUnitClassName } onClick={this.handleClick}></span>
        )
    }
}


class AppComponent extends React.Component {
    constructor(props) {
        super(props);
        this.Constant = {
            centerPos: {
                left: 0,
                right: 0
            },
            hPosRange: { //水平方向的取值范围
                leftSecX: [0, 0],
                rightSecX: [0, 0],
                y: [0, 0]
            },
            vPosRange: { //垂直方向
                x: [0, 0],
                topY: [0, 0]
            }
        };
        this.state = {
            imgsArrangeArr: [
                //{
                //  pos:{
                //    left:'0',
                //    top:'0'
                //  },
                // rotate:0, //旋转角度
                // isInverse:false //正反面
                // isCenter:false 图片是否居中
                //}
            ]
        };

    }

    //翻转图片的函数
    // @param index 输入当前执行inverse操作的图片对应的图片信息数组的index值
    // @return {Function} 这是一个闭包函数，期内return一个真正带被执行的函数
    inverse(index) {
        return () => {
            let imgsArrangArr = this.state.imgsArrangeArr;
            imgsArrangArr[index].isInverse = !imgsArrangArr[index].isInverse;
            this.setState({
                imgsArrangeArr: imgsArrangArr
            })
        }
    }

    // 重新布局所有图片
    // @param centerIdex 指定居中排布哪个图片
    rearrange(centerIndex) {
        let imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSecX = hPosRange.leftSecX,
            hPosRangeRightSecX = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeTopY = vPosRange.topY,
            vPosRangeX = vPosRange.x,

            imgsArrangTopArr = [], // 上测区域的状态信息
            topImgNum = Math.floor(Math.random() * 2), //取一个或者取0个
            topImgSpiceIndex = 0,
            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
        // 首先居中centerIndex图片 ,centerIndex图片不需要旋转
        imgsArrangeCenterArr[0] = {
            pos: centerPos,
            rotate: 0,
            isCenter: true
        }
        // 取出要布局上测的图片的状态信息
        topImgSpiceIndex = Math.floor(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangTopArr = imgsArrangeArr.splice(topImgSpiceIndex, topImgNum);

        // 布局位于上侧的图片
        imgsArrangTopArr.forEach((value, index) => {
            imgsArrangTopArr[index] = {
                pos: {
                    top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                    left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false

            };
        });

        //布局左两侧的图片
        for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
            let hPosRangeLORX = null; // 左右x的取值范围

            // 前半部分布局左边,右边部分布局右边
            if (i < k) {
                hPosRangeLORX = hPosRangeLeftSecX;
            } else {
                hPosRangeLORX = hPosRangeRightSecX
            }
            imgsArrangeArr[i] = {
                pos: {
                    top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                    left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
            };
        }


        // 取刚才处理的一个元素填充上测位置
        if (imgsArrangTopArr && imgsArrangTopArr[0]) {
            imgsArrangeArr.splice(topImgSpiceIndex, 0, imgsArrangTopArr[0]);
        }
        // 填充中心区域的图片
        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);
        // 触发重新渲染
        this.setState({
            imgsArrangeArr: imgsArrangeArr
        });
    }


    /* 利用rearrange函数，居中对应index的图片
     * @param index，需要被居中的图片对应的图片信息数组的index值
     */
    center(index) {
        return () => {
            this.rearrange(index);
        }
    }


    // 拿到舞台的大小
    componentDidMount() {
        let stageDOM = ReactDOM.findDOMNode(this.refs.stage), // 当前舞台的dom
            stageW = stageDOM.scrollWidth, // 整个画廊的宽度
            stageH = stageDOM.scrollHeight, // 整个画廊的高度

            halfStageW = Math.ceil(stageW / 2), // 整个画廊一般的宽度
            halfStageH = Math.ceil(stageH / 2); // 整个画廊一半的高度
        console.log(stageDOM);

        // 拿到一个imgFigure的大小
        let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
            imgW = imgFigureDOM.scrollWidth,
            imgH = imgFigureDOM.scrollHeight,
            halfImgW = Math.ceil(imgW / 2),
            halfImgH = Math.ceil(imgH / 2);

        // 计算中心图片的位置点
        this.Constant.centerPos = {
            left: halfStageW - halfImgW,
            top: halfStageH - halfImgH
        }
        // 计算左侧，右侧区域图片排布的取值范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;

        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;

        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;
        
        // 计算上测区域图片排布的取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;

        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;

        this.rearrange(0);

    }

    render() {

        let controllerUnits = [],
            imgFigures = [];

        imageDatas.forEach((value, index) => {

            if (!this.state.imgsArrangeArr[index]) {
                this.state.imgsArrangeArr[index] = {
                    pos: {
                        left: 0,
                        top: 0
                    },
                    rotate: 0,
                    isInverse: false,
                    isCenter: false
                }
            }

            imgFigures.push(<ImgFigure data={value} key={index} ref={'imgFigure' + index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);

            controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);

        });

        return (
            <section className="stage" ref="stage">
                <section className="img_sec">
                {imgFigures}
                </section>
                <nav className="controller_nav">
                {controllerUnits}
                </nav>
            </section>
        );
    }
}

AppComponent.defaultProps = {};
export default AppComponent;

