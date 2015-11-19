<?php
/**
 * Created by PhpStorm.
 * User: dmitry
 * Date: 05.11.15
 * Time: 10:16
 */

class JuryController extends CController
{
    private $method = "jury";

    public function actionGet()
    {
        $teams = Teams::model()->findAll();

        $services = Services::model()->findAll();
        $array_teams = array();
        $array_services = array();
        foreach($teams as $k=>$v) {
            $team = $v->getAttributes();

            $array_teams[] = array(
                'name' => $team['nick'],
                'network' => $team['host'],
                'host' => $team['host']
            );
        }

        foreach($services as $k=>$v) {
            $team = $v->getAttributes();

            $array_services[] = array(
                'name' => $team['name'],
                'timeout' => $team['timeout'],
                'program' => $team['program']
            );
        }
        echo json_encode(array(
            "method" => "get",
            "response" => array(
            "settings" => array(
                "time" => array(
                    "start" => mktime(0,0,0, 11,1,2015),
                    "end" => mktime(0,0,0, 12, 1, 2015)
                ),
                "name" => "",
                "round_length" => 10,
                "flags" => array(
                    "port" => 2605
                ),
                "admin" => array(
                    "login" => "root",
                    "pass" => "qwe"
                )
            ),
            "teams" => $array_teams,
            "services" => $array_services
        )), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
}