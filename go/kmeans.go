package main

import (
	"fmt"
	"math"
	"math/rand"
	"time"
	"reflect"
	"syscall/js"
)

type Dataset [][3]int
type Clusters [][2]int

/*
dataset初期化
クラスタをランダムに決定
戻り値：dataset
*/
func initData(dataset Dataset, k int) Dataset {
	rand.Seed(time.Now().UnixNano())
	for i := 0; i < len(dataset); i++ {
		dataset[i][2] = rand.Intn(k)
	}
	return dataset
}

/*
クラスタの重心計算
戻り値：clusters
*/
func calcCenter(dataset Dataset, clusters Clusters) Clusters {
	for i := 0; i < len(clusters); i++ {
		for coord := 0; coord < 2; coord++ {
			sumCoords := 0
			count := 0
			for _, data := range dataset {
				if data[2] != i {
					continue
				}
				count++
				sumCoords += data[coord]
			}
			if count > 0 {
				clusters[i][coord] = sumCoords/count
			}
		}
	}
	return clusters
}

/*
各クラスタの重心をデータと比較し再決定
戻り値：dataset
*/
func compareCenter(dataset Dataset, clusters Clusters) Dataset {
	for i := 0; i < len(dataset); i++ {
		nowDistance := math.Sqrt(math.Pow(float64(dataset[i][0] - clusters[dataset[i][2]][0]), 2) + math.Pow(float64(dataset[i][1] - clusters[dataset[i][2]][1]), 2))
		for j, cluster := range clusters {
			distance := math.Sqrt(math.Pow(float64(dataset[i][0] - cluster[0]), 2) + math.Pow(float64(dataset[i][1] - cluster[1]), 2))
			if distance < nowDistance {
				dataset[i][2] = j
			}
		}
	}
	return dataset
}

/*
k平均法
戻り値：datasetのjs配列
*/
func kMeans(this js.Value, args []js.Value) interface{} {
	k := args[1].Int()
	length := args[0].Get("length").Int()
	dataset := make(Dataset, length)
	for i := 0; i < length; i++ {
	  dataset[i][0] = args[0].Index(i).Index(0).Int()
		dataset[i][1] = args[0].Index(i).Index(1).Int()
	}
	clusters := make(Clusters, k)
	beforeClusters := make(Clusters, k)

	dataset = initData(dataset, k)
	for {
		clusters = calcCenter(dataset, clusters)
		dataset = compareCenter(dataset, clusters)
		if reflect.DeepEqual(beforeClusters, clusters) {
			break
		}
		copy(beforeClusters, clusters)
	}

	dataset_js := js.Global().Get("Array").New()
	for _, data := range dataset {
		dataset_js.Call("push", data[2])
	}
	return dataset_js
}

/*
kMeansをjsに登録
*/
func registerCallbacks() {
	js.Global().Set("kMeans", js.FuncOf(kMeans))
}

func main() {
	c := make(chan struct{}, 0)
	fmt.Println("Go WebAssembly Initialized")
	registerCallbacks()
	<-c
}
