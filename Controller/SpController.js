const fs = require('fs');
const { Writable } = require('stream');

const errorArray = [];


 function cleanURL(url) {
  // Remove the last 15 characters from the URL
 try{
   const modifiedURL = url.slice(0, -25);
   return modifiedURL;

 }
 catch(err){
console.log(err);
return ""
 }
 } 

 function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
let randomNumber = 5000;



class JSONWritableStream extends Writable {
  constructor(filename) {
    super();
    this.filename = filename;
  }

  _write(chunk, encoding, callback) {
    fs.appendFile(this.filename, chunk, encoding, (err) => {
      if (err) {
        console.error(`An error occurred while saving data to ${this.filename}:`, err);
        callback(err);
      } else {
        console.log(`Data saved to ${this.filename}`);
        callback();
      }
    });
  }
}

exports.StartScraping_Get = async(req, res)=>{
    try {
         const query = req.query;
         const HOST = query?.host ?? ""
        const response1 = await fetch(`${HOST}/zomato?skip=${query?.skip?? 0}&limit=${query.limit??10}`);
        const data1 = await response1.json();
         let count = query?.skip;
         res.status(500).json({"mess": "Process Started"})

        for (const array of data1.product) {
          try {

             const baseURL =  cleanURL(array?.destination_url);
             const imageFetchSteing = baseURL+"photos"
             const reviewsFetchSteing = baseURL+"reviews"
             const orderFetchSteing = baseURL+"order"
             randomNumber = getRandomNumber(3000, 5000);
             const response_item = await fetch(baseURL, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
              }
            });
            const response_image = await fetch(imageFetchSteing, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
              }
            });
            const response_review = await fetch(reviewsFetchSteing, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
              }
            });
            const response_order= await fetch(orderFetchSteing, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
              }
            });
            if (!response_item.ok  || !response_image.ok || !response_review.ok || !response_order.ok  ) {
              throw new Error('Failed to fetch data');
            }
            const item = await response_item.json();
            const images = await response_image.json();
            const reviews = await response_review.json();
            const order = await response_order.json();
            const payLoad = {
    
              restaurentName: order?.page_data?.sections?.SECTION_BASIC_INFO?.name ? order?.page_data?.sections?.SECTION_BASIC_INFO?.name: item?.page_data?.sections?.SECTION_BASIC_INFO?.name ?? "Dummy Restaurent",
              res_thumb: order.page_data.sections.SECTION_BASIC_INFO.res_thumb? order.page_data.sections.SECTION_BASIC_INFO.res_thumb :  item.page_data.sections.SECTION_BASIC_INFO.res_thumb ?? "https://i.pinimg.com/736x/63/bc/77/63bc77206180eb114cfb3aa61c11e86c.jpg",
              cuisine_string:  order.page_data.sections.SECTION_BASIC_INFO.cuisine_string ?order.page_data.sections.SECTION_BASIC_INFO.cuisine_string  : item.page_data.sections.SECTION_BASIC_INFO.cuisine_string ??  "",
        
              rating: {
                aggregate_rating: order?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.aggregate_rating?  order?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.aggregate_rating : item?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.aggregate_rating?? 0,
                votes: order?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.votes ? order?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.votes: item?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.votes?? 0,
        
                DINING: {
                    "rating_type": "DINING",
                    "rating": order?.page_data?.sections?.SECTION_BASIC_INFO?.rating_new?.ratings?.DINING?.rating ?? "",
                    "reviewCount": order?.page_data?.sections?.SECTION_BASIC_INFO?.rating_new?.ratings?.DINING?.reviewCount?? "",
                  },
                DELIVERY: {
                    "rating_type": "DELIVERY",
                    "rating": order?.page_data?.sections?.SECTION_BASIC_INFO?.rating_new?.ratings?.DELIVERY?.rating ?? "",
                    "reviewCount": order?.page_data?.sections?.SECTION_BASIC_INFO?.rating_new?.ratings?.DELIVERY?.reviewCount ?? "",
                  },
        
                  reviewData:   reviews?.page_data?.sections?.SECTION_REVIEWS?.entities[0]?.entity_ids?.map((ids)=>{
                    return  reviews?.entities?.REVIEWS[ids]
                  }) ?? []
               },
           
                menu: {
                img: order?.page_data.sections?.SECTION_RES_DETAILS?.IMAGE_MENUS?.menus[0]?.thumb ?? "",
                  itemsName: order?.page_data?.order?.menuList?.menus?.map((element)=>{
                  return  element?.menu?.name ?? ""
                }) ?? [],
                 items:  order?.page_data?.order?.menuList?.menus?.map((element)=>{
                  return  {name: element?.menu?.name  ?? "", items : element?.menu?.categories[0]?.category?.items.map((items)=>( 
                
                    {
                      "id":  items?.item?.id ?? "",
                      "name": items?.item?.name ?? "",
                      "price": items?.item?.price ?? 0,
                      "desc": items?.item?.desc ?? 0,
                      "item_image_url": items?.item?.item_image_url ?? "",
                      "item_image_thumb_url":  items?.item?.item_image_thumb_url ?? "",
                      "tag_slugs":  items?.item?.tag_slugs ?? [],
                      "service_slugs":items?.item?.service_slugs ?? [],
                      "search_alias": items?.item?.search_alias ?? "",          
                    }
        
              
                  )) ?? []
            
            }
            })
        
          },
         
          images:  images?.page_data?.sections?.SECTION_GALLERY_PHOTOS?.entities[0]?.entity_ids?.map((ids)=>{
            return  images?.entities?.IMAGES[ids]
          }) ?? [],
        
            timing: {
                  "opening_hours": order?.page_data?.sections?.SECTION_BASIC_INFO?.timing?.customised_timings?.opening_hours
                },
        
        
            is_delivery_only:   order?.page_data?.sections?.SECTION_BASIC_INFO?.is_delivery_only ?? false,
        
             location: {
                LOCALITY: {
                    "text": order?.page_data?.sections?.SECTION_RES_HEADER_DETAILS?.LOCALITY?.text ?? "",
                    "url": order?.page_data?.sections?.SECTION_RES_HEADER_DETAILS?.LOCALITY?.url ?? ""
                  },
                  "city_id": order?.page_data?.sections?.SECTION_RES_CONTACT?.city_id ?? 0,
                  "city_name": order?.page_data?.sections?.SECTION_RES_CONTACT?.city_name ?? "",
                  "country_name": order?.page_data?.sections?.SECTION_RES_CONTACT?.country_name?? "",
                  "zipcode": order?.page_data?.sections?.SECTION_RES_CONTACT?.zipcode ?? '',
                  "locality_verbose": order?.page_data?.sections?.SECTION_RES_CONTACT?.locality_verbose ?? "",
                  "latitude": order?.page_data?.sections?.SECTION_RES_CONTACT?.latitude?? 0,
                  "longitude": order?.page_data?.sections?.SECTION_RES_CONTACT?.longitude??0,
                  "static_map_url": order?.page_data?.sections?.SECTION_RES_CONTACT?.static_map_url ?? "",
                  "address": order?.page_data?.sections?.SECTION_RES_CONTACT?.address ?? "",
                  "phoneDetails": order?.page_data?.sections?.SECTION_RES_CONTACT?.phoneDetails ?? 0
        
             },
        
             "PEOPLE_LIKED": item?.page_data?.sections?.SECTION_RES_DETAILS?.PEOPLE_LIKED?.description ? item?.page_data?.sections?.SECTION_RES_DETAILS?.PEOPLE_LIKED?.description: order?.page_data?.sections?.SECTION_RES_DETAILS?.PEOPLE_LIKED?.description ?? "",
        
        
             Average_Cost: {
                title: item?.page_data?.sections?.SECTION_RES_DETAILS?.CFT_DETAILS?.cfts[0]?.title,
        
             },
        
             paymentsMethod : {
              digital_Payment: item?.page_data?.sections?.SECTION_RES_DETAILS?.CFT_DETAILS?.accepted_payments?.includes("payments accepted")? true: false
             },
             "HIGHLIGHTS":  item?.page_data?.sections?.SECTION_RES_DETAILS?.HIGHLIGHTS?.highlights.map((itm)=>( itm.text )) ?? [],
             
            }
             
              RestaurentsPayload = {
              Zoma_uid: order?.page_info?.pageUrl ? "https://www.zomato.com"+ ( (order?.page_info?.pageUrl).split("/").slice(0,order?.page_info?.pageUrl.split("/").length-1).join("/")): "https://www.zomato.com"+ (item?.page_info?.pageUrl.split("/").slice(0,item?.page_info?.pageUrl.split("/").length-1).join("/")) ,
              restaurentName: order?.page_data?.sections?.SECTION_BASIC_INFO?.name ? order?.page_data?.sections?.SECTION_BASIC_INFO?.name: item?.page_data?.sections?.SECTION_BASIC_INFO?.name ?? "Dummy Restaurent",
              res_thumb: order.page_data.sections.SECTION_BASIC_INFO.res_thumb? order.page_data.sections.SECTION_BASIC_INFO.res_thumb :  item.page_data.sections.SECTION_BASIC_INFO.res_thumb ?? "https://i.pinimg.com/736x/63/bc/77/63bc77206180eb114cfb3aa61c11e86c.jpg",
              cuisine_string:  order.page_data.sections.SECTION_BASIC_INFO.cuisine_string ?order.page_data.sections.SECTION_BASIC_INFO.cuisine_string  : item.page_data.sections.SECTION_BASIC_INFO.cuisine_string ??  "",
        
              rating: {
                aggregate_rating: order?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.aggregate_rating?  order?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.aggregate_rating : item?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.aggregate_rating?? 0,
                votes: order?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.votes ? order?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.votes: item?.page_data?.sections?.SECTION_BASIC_INFO?.rating?.votes?? 0,
        
                DINING: {
                    "rating_type": "DINING",
                    "rating": order?.page_data?.sections?.SECTION_BASIC_INFO?.rating_new?.ratings?.DINING?.rating ?? "",
                    "reviewCount": order?.page_data?.sections?.SECTION_BASIC_INFO?.rating_new?.ratings?.DINING?.reviewCount?? "",
                  },
                DELIVERY: {
                    "rating_type": "DELIVERY",
                    "rating": order?.page_data?.sections?.SECTION_BASIC_INFO?.rating_new?.ratings?.DELIVERY?.rating ?? "",
                    "reviewCount": order?.page_data?.sections?.SECTION_BASIC_INFO?.rating_new?.ratings?.DELIVERY?.reviewCount ?? "",
                  },
               },
           
              menu: {
                img: order?.page_data.sections?.SECTION_RES_DETAILS?.IMAGE_MENUS?.menus[0]?.thumb ?? "",
                  itemsName: order?.page_data?.order?.menuList?.menus?.map((element)=>{
                  return  element?.menu?.name ?? ""
                }) ?? [],
                },
         
           images:  images?.page_data?.sections?.SECTION_GALLERY_PHOTOS?.entities[0]?.entity_ids?.map((ids)=>{
            return  images?.entities?.IMAGES[ids].url ? images?.entities?.IMAGES[ids].url : images?.entities?.IMAGES[ids].thumbUrl
           }).slice(0,5) ?? [],
        
            timing: {
                  "opening_hours": order?.page_data?.sections?.SECTION_BASIC_INFO?.timing?.customised_timings?.opening_hours
                },
        
        
            is_delivery_only:   order?.page_data?.sections?.SECTION_BASIC_INFO?.is_delivery_only ?? false,
        
             location: {
                LOCALITY: {
                    "text": order?.page_data?.sections?.SECTION_RES_HEADER_DETAILS?.LOCALITY?.text ?? "",
                    "url": order?.page_data?.sections?.SECTION_RES_HEADER_DETAILS?.LOCALITY?.url ?? ""
                  },
                  "city_id": order?.page_data?.sections?.SECTION_RES_CONTACT?.city_id ?? 0,
                  "city_name": order?.page_data?.sections?.SECTION_RES_CONTACT?.city_name ?? "",
                  "country_name": order?.page_data?.sections?.SECTION_RES_CONTACT?.country_name?? "",
                  "zipcode": order?.page_data?.sections?.SECTION_RES_CONTACT?.zipcode ?? '',
                  "locality_verbose": order?.page_data?.sections?.SECTION_RES_CONTACT?.locality_verbose ?? "",
                  "latitude": order?.page_data?.sections?.SECTION_RES_CONTACT?.latitude?? 0,
                  "longitude": order?.page_data?.sections?.SECTION_RES_CONTACT?.longitude??0,
                  "address": order?.page_data?.sections?.SECTION_RES_CONTACT?.address ?? "",
                  "phoneDetails": order?.page_data?.sections?.SECTION_RES_CONTACT?.phoneDetails ?? 0
        
             },
        
             "PEOPLE_LIKED": item?.page_data?.sections?.SECTION_RES_DETAILS?.PEOPLE_LIKED?.description ? item?.page_data?.sections?.SECTION_RES_DETAILS?.PEOPLE_LIKED?.description: order?.page_data?.sections?.SECTION_RES_DETAILS?.PEOPLE_LIKED?.description ?? "",
        
        
             Average_Cost: {
                title: item?.page_data?.sections?.SECTION_RES_DETAILS?.CFT_DETAILS?.cfts[0]?.title,
        
             },
        
             paymentsMethod : {
              digital_Payment: item?.page_data?.sections?.SECTION_RES_DETAILS?.CFT_DETAILS?.accepted_payments?.includes("payments accepted")? true: false
             },
             "HIGHLIGHTS":  item?.page_data?.sections?.SECTION_RES_DETAILS?.HIGHLIGHTS?.highlights.map((itm)=>( itm.text )) ?? [],
             
               }
        console.log(RestaurentsPayload,"RestaurentsPayload")
          const restaurentResponse = await fetch(`${HOST}/restaurents`, {
            method: "POST", 
            body: JSON.stringify(RestaurentsPayload),
            headers: {
                "Content-Type": "application/json", // Specify content type as JSON
            }
          });
          const restaurentData = await restaurentResponse.json()
            
             reviewPayload = {
              Zoma_uid: order?.page_info?.pageUrl ? "https://www.zomato.com"+ ( (order?.page_info?.pageUrl).split("/").slice(0,order?.page_info?.pageUrl.split("/").length-1).join("/")): "https://www.zomato.com"+ (item?.page_info?.pageUrl.split("/").slice(0,item?.page_info?.pageUrl.split("/").length-1).join("/")) ,
              refId: restaurentData._id,
              data: reviews?.page_data?.sections?.SECTION_REVIEWS?.entities[0]?.entity_ids?.map((ids)=>{
                return  reviews?.entities?.REVIEWS[ids]
              }) ?? []
             }
             
             items_Menu_Payload ={
              Zoma_uid: order?.page_info?.pageUrl ? "https://www.zomato.com"+ ( (order?.page_info?.pageUrl).split("/").slice(0,order?.page_info?.pageUrl.split("/").length-1).join("/")): "https://www.zomato.com"+ (item?.page_info?.pageUrl.split("/").slice(0,item?.page_info?.pageUrl.split("/").length-1).join("/")) ,
              refId: restaurentData._id,
              data: order?.page_data?.order?.menuList?.menus?.map((element)=>{
                return  {name: element?.menu?.name  ?? "", items : element?.menu?.categories[0]?.category?.items.map((items)=>( 
              
                  {
                    "id":  items?.item?.id ?? "",
                    "name": items?.item?.name ?? "",
                    "price": items?.item?.price ?? 0,
                    "desc": items?.item?.desc ?? 0,
                    "item_image_url": items?.item?.item_image_url ?? "",
                    "tag_slugs":  items?.item?.tag_slugs ?? [],
                    "service_slugs":items?.item?.service_slugs ?? [],
                    "search_alias": items?.item?.search_alias ?? "",          
                  }
      
            
                )) ?? []
          
          }
                })
             }
             
             imagesPayload = {
              Zoma_uid: order?.page_info?.pageUrl ? "https://www.zomato.com"+ ( (order?.page_info?.pageUrl).split("/").slice(0,order?.page_info?.pageUrl.split("/").length-1).join("/")): "https://www.zomato.com"+ (item?.page_info?.pageUrl.split("/").slice(0,item?.page_info?.pageUrl.split("/").length-1).join("/")) ,
              refId: restaurentData._id,
              data:  images?.page_data?.sections?.SECTION_GALLERY_PHOTOS?.entities[0]?.entity_ids?.map((ids)=>{
                return  images?.entities?.IMAGES[ids]
              }) ?? []
             }
           
             // diff DB
    
             const ReviewResponse = await fetch(`${HOST}/reviews`, {
              method: "POST", 
              body: JSON.stringify(reviewPayload),
              headers: {
                  "Content-Type": "application/json", // Specify content type as JSON
              }
            });
    
            const imageResponse = await fetch(`${HOST}/images`, {
              method: "POST", 
              body: JSON.stringify(imagesPayload),
              headers: {
                  "Content-Type": "application/json", // Specify content type as JSON
              }
            });
    
            const item_Menu_Response = await fetch(`${HOST}/items`, {
              method: "POST", 
              body: JSON.stringify(items_Menu_Payload),
              headers: {
                  "Content-Type": "application/json", // Specify content type as JSON
              }
            });
            // const ReviewResponseData = await ReviewResponse.json()
    
             // const pushStream = new JSONWritableStream('db3.json');
            //  const jsonData = JSON.stringify(payLoad, null, 2); // Your JSON object here
              //pushStream.write(jsonData + "," );
             // pushStream.end();
            
          }  
          catch (error) {
                console.error(error);
          }
          console.log(count);
          count++;
          // Add a delay here (e.g., 1000 ms)
          await new Promise(resolve => setTimeout(resolve, randomNumber));
        }


    
        }
    catch (error) {
        console.error(error);
        res.status(500).json({"mess": "Process Started"})
       }
}