import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PayOPT from "../Smcompo/Paycomp/PayOPT";
// import { formatDate, gst, rechargepercentage, totalAmount } from "../../app/helper/helper";
import { useDispatch, useSelector } from "react-redux";
//import { sendRequestCoupon } from "../../app/redux/reducer/coupon/getCouponList";





export default function CartPage({ rechargedata }) {
  const searchParams = useSearchParams();
  const [showProDetail, setShowProDetail] = useState(true);
  const [openCoup, setOpenCoup] = useState(false);

  const [gstamount, setGstAmount] = useState(gst(rechargedata?.package_amount));
  const total = totalAmount(gstamount, rechargedata?.package_amount);
  const { loading, couponlist, error } = useSelector((state) => state.getcoupon);




  const listcoupon = useMemo(() => {
    return couponlist?.data;
  }, [couponlist])







  const dispatch = useDispatch();


  const [coupon, setCoupon] = useState({
    couponname: null,
    couponprice: 0,
    coupon_id: 0,
  });
  useEffect(() => {
    if (searchParams.get("showProDetail") === "false") {
      setShowProDetail(false);
    }
  }, [searchParams]);

  const openCoupPop = () => {
    setOpenCoup(true);
  };
  const closeCoup = () => {
    setOpenCoup(false);
  };

  const apply_coupon = (coupon, price, id) => {

    const percentage = rechargepercentage(rechargedata?.package_amount, price);
    setCoupon({
      couponname: coupon,
      couponprice: percentage || 0,
      coupon_id: id,
    });
    setOpenCoup(false);
  };

  const editCoupon = () => {
    setOpenCoup(true);
  };

  useEffect(() => {
    //dispatch(sendRequestCoupon());

  }, [dispatch])

  const coupnclose = () => {
    setCoupon(false);
    setOpenCoup(false);

  };

  return (
    <div className="text-gray-500 lg:w-[80%] w-full   md:p-4 p-2 bg-white rounded-xl shadow-md flex flex-col gap-3 my-2 md:my-8 place-self-center">
      {/* <h5 className="py-2 text-base font-semibold text-white bg-purple-400 rounded-full sm:text-xl px-15 place-self-center">Payment Details</h5> */}
      {/* {showProDetail && <Prodetail />} */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-2 text-white shadow-2xl rounded-xl sm:p-4">
          <h3 className=" bg-[linear-gradient(to_right,#a65ed677_54%,#ba38cb67_100%)] py-1 px-2 place-self-center w-full rounded-lg text-sm sm:text-lg font-bold mb-2">
            Recharge{" "}
          </h3>
          <div className="p-2 space-y-2 text-black bg-white rounded-xl sm:p-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Amount</span>
              <span className="text-sm"> {rechargedata?.package_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">GST @18%</span>
              <span className="text-sm">{gstamount}</span>
            </div>

            <hr />
            <div className="flex flex-col justify-between ">
              {!coupon?.couponname && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium"> Coupon Discount</span>
                  <button
                    onClick={openCoupPop}
                    className="text-green-500 text-sm cursor-pointer"
                  >
                    Apply Coupon
                  </button>
                </div>
              )}
              {coupon?.couponname && (
                <div className="flex flex-col justify-center text-sm font-semibold bg-purple-100 rounded-lg p-1 px-2">
                  <div className="flex  justify-between text-sm font-semibold bg-purple-100 rounded-lg">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M96 128C60.7 128 32 156.7 32 192L32 256C32 264.8 39.4 271.7 47.7 274.6C66.5 281.1 80 299 80 320C80 341 66.5 358.9 47.7 365.4C39.4 368.3 32 375.2 32 384L32 448C32 483.3 60.7 512 96 512L544 512C579.3 512 608 483.3 608 448L608 384C608 375.2 600.6 368.3 592.3 365.4C573.5 358.9 560 341 560 320C560 299 573.5 281.1 592.3 274.6C600.6 271.7 608 264.8 608 256L608 192C608 156.7 579.3 128 544 128L96 128zM448 400L448 240L192 240L192 400L448 400zM144 224C144 206.3 158.3 192 176 192L464 192C481.7 192 496 206.3 496 224L496 416C496 433.7 481.7 448 464 448L176 448C158.3 448 144 433.7 144 416L144 224z" /></svg>                      {coupon.couponname}
                    </span>
                    <span className="text-green-500">
                      + {coupon.couponprice}
                    </span>
                  </div>
                  <button
                    onClick={editCoupon}
                    className="text-red-400 cursor-pointer border border-red-400 self-end rounded-full px-2 py-0 text-[9px] bg-white "
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            {openCoup && (
              <div className="inset-0 absolute z-100 backdrop-blur-xs bg-[#00000056] w-full flex justify-center items-center">
                <div className="flex w-2xl gap-3  flex-col border border-gray-300 rounded-2xl bg-white ">
                  <div className="grid grid-cols-3 w-full justify-between items-center rounded-lg p-2 bg-purple-200 px-3">
                    <span className="flex col-span-2 justify-end font-bold self-end mr-8 items-end">
                      Available Coupons 1
                    </span>{" "}
                    <button
                      onClick={closeCoup}
                      className="flex cursor-pointer  justify-end ">
                      <svg width={18} height={18} viewBox="0 0 640 640"><path d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C221.6 240.4 221.6 255.6 231 264.9L286 319.9L231 374.9C221.6 384.3 221.6 399.5 231 408.8C240.4 418.1 255.6 418.2 264.9 408.8L319.9 353.8L374.9 408.8C384.3 418.2 399.5 418.2 408.8 408.8C418.1 399.4 418.2 384.2 408.8 374.9L353.8 319.9L408.8 264.9C418.2 255.5 418.2 240.3 408.8 231C399.4 221.7 384.2 221.6 374.9 231L319.9 286L264.9 231C255.5 221.6 240.3 221.6 231 231z" /></svg>                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2  p-5">
                    <div className="coup-css flex items-center justify-between w-70">
                      <span className="text-xs"  >Continue without Coupon</span>
                      <button onClick={coupnclose}
                        className="flex px-2 cursor-pointer py-0.5 rounded-full border border-gray-300 bg-purple-400 text-[12px] text-white">
                        Click
                      </button>
                    </div>

                    {
                      listcoupon?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No coupon history found</p>
                      ) : (
                        listcoupon?.map((item, index) => (
                          <div
                            key={index}
                            className="coup-css flex flex-col gap-0 w-70"
                          >
                            <div className="flex items-center justify-between">
                              <span className="CouponsSection_couponCodeTitle">
                                <h6 className="font-bold text-purple-500">
                                  {item?.code}
                                </h6>
                              </span>

                              <button
                                onClick={() => apply_coupon(item?.code, item?.percentage, item?.id)}
                                className="flex px-2 cursor-pointer py-1 rounded-full border border-gray-300 bg-purple-400 text-sm text-white"
                                data-coupon={item?.code}
                              >
                                Apply
                              </button>
                            </div>

                            <div className="text-sm font-semibold">
                              Cashback of ₹ {item?.percentage}
                            </div>

                            {/* <small>Expires on: {formatDate(item?.end_date)}</small> */}
                          </div>
                        ))
                      )
                    }

                  </div>
                </div>
              </div>
            )}
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-sm font-medium">Total Payable Amount</span>
              <span className="text-sm"> ₹ {total}</span>
            </div>
          </div>
        </div>
        <PayOPT
          amount={rechargedata?.package_amount}
          oriamount={rechargedata?.package_amount}
          coupon_id={coupon?.coupon_id || 0}
          couponprice={coupon?.couponprice || 0}

        />
      </div>
    </div>
  );
}
